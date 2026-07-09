# JomExam Diagnostic Platform — Architecture Spec

**Purpose:** a browser-based diagnostic test that simulates real TMUA/ESAT computer-based test
conditions, captures per-question timing and flagging behaviour, and produces a Skills Radar
report on completion — plus the admin-side content authoring tool needed to actually populate it,
and a staged plan for building both without risking the current live site.

**Stack assumed:** Next.js frontend (`ClintonWeeYuan/math-fe`) → FastAPI backend
(`ClintonWeeYuan/math-be`, Docker on Railway, fronted by `www.jomexam.com`) → Supabase Postgres,
accessed by the backend via the `service_role` key. **The frontend never talks to Supabase
directly** — no `createClient()` calls exist despite `@supabase/supabase-js` being listed as a
dependency; all communication goes through a generated OpenAPI client (`src/client/`) against the
FastAPI backend. This matters throughout the spec below: every "server-authoritative" requirement
means *a FastAPI route handler*, not a Supabase Edge Function or a Next.js API route — neither of
those patterns exists in this codebase, and this spec doesn't introduce a second server-side
pattern alongside the one already in use.

**Frontend and backend are two fully separate git repos with no shared root** — this file should
exist as `docs/diagnostic-platform-spec.md` in *both* repos. If revised, update both copies.

**Operational context confirmed by the Stage 0 audit** (§8): no CI/CD (no `.github/` workflows),
no local migration tooling, no Supabase branching or preview environments — one Supabase project,
one `.env`, the live production database is the only database. Every schema change ships straight
to prod unless a throwaway local Postgres or a manually-created Supabase branch is used to test it
first. Treat that as mandatory, not optional, given there's no other safety net.

**Status:** Stage 0 audit complete (§8). **Stage 1 schema migration complete and merged** — built,
reviewed across three rounds (missing FK indexes, a missing FK entirely on
`diagnostic_question_events.question_id`, and a deliberate decision not to index it further —
see §3 and §10), matches the shipped migration exactly. **Stage 2 (admin auth enforcement)
complete and merged** — the `require_admin` FastAPI dependency exists and is fully tested, but
deliberately wired into zero routes so far (see §10). Stage 3 (the admin tool itself) is next.

---

## 1. Exam session lifecycle

```
[Landing/instructions] → [in_progress] → [submitted | timed_out | abandoned] → [report]
```

- **Landing/instructions**: shows time limit, question count, an agreement checkbox ("I won't
  reproduce or share this content") before the attempt starts. This checkbox is what gives the
  traceability layer (§5) legal teeth later.
- **in_progress**: the timer starts server-side the moment the attempt row is created — a FastAPI
  endpoint sets `server_deadline_at = now() + time_limit` and returns it to the client. The client
  displays a countdown calculated from this, but the **FastAPI backend, not the client, is the
  source of truth** for when time is up. Never trust a client-reported "time's up" — a student
  could pause their laptop clock or edit local JS state. On every answer/flag/navigation request,
  the FastAPI route handler re-checks `now() < server_deadline_at` before accepting the write —
  this is an explicit `if` check in the handler, not something RLS or the database enforces (see
  the RLS note in §3).
- **submitted / timed_out**: attempt is locked (no further writes accepted), scoring runs, report
  is generated.
- **abandoned**: attempt exists but student closed the tab and never returned. Worth tracking
  separately from "timed_out" — it's a different signal (they gave up vs. ran out of time), and
  matters if you ever want to follow up with agents/parents about drop-off.

---

## 2. Exam-taking UI (matching real CBT conditions)

Real computer-based tests (Pearson VUE-style, which is the TMUA/ESAT delivery model) share a
fairly standard UI pattern — worth matching closely, since part of what you're diagnosing is
whether the student can operate under those specific conditions, not just whether they know the
maths:

- **Single question per screen**, not a scrollable list. This matters — a scrollable list lets
  students subconsciously gauge "how much is left" differently than a real CBT does, and changes
  pacing behaviour.
- **Always-visible countdown timer**, non-hideable. (Real tests don't let you hide the clock —
  don't make your diagnostic easier than the real thing.)
- **Question navigator panel**: a grid of question numbers, colour-coded —
  unanswered / answered / flagged. Click any number to jump directly there. This is standard CBT
  UX and is also exactly the data structure you want for the report later.
- **Flag for review** button on every question — toggles a flag, doesn't affect scoring, purely
  a student self-signal.
- **Next / Previous**, plus free navigation via the grid (real tests generally allow this within
  a section).
- **Review screen before final submit**: "You've answered 34/40, flagged 5, left 6 unanswered —
  submit now?" Mirrors real exam software and reduces accidental early submission complaints.
- **Auto-submit on timeout**, no grace period, matching real conditions exactly.

Friendliness note: "user-friendly" and "faithful simulation" pull in slightly different
directions — a real CBT isn't especially friendly, it's stressful by design. I'd resolve this by
keeping the *exam screen itself* strict and faithful (that's the point of a diagnostic — you want
real time-pressure behaviour, not relaxed behaviour), and putting all the friendliness into the
screens *around* it: a calm, clear instructions page, a reassuring review screen, and a report
that's genuinely easy to read (§6). Don't soften the exam itself — that would quietly corrupt the
one thing you're trying to measure.

---

## 3. Data model

Every table below is prefixed `diagnostic_` — the audit confirmed `public.questions` already
exists as part of the SPM Math product (different shape entirely: `paper_instance_id`,
Storage-rendered `question_url`/`answer_url`, flat `question_option` rows). Rather than bend one
product's schema to fit the other, the two stay fully separate at the table level. This also makes
the product boundary self-documenting to anyone reading the schema later.

```sql
-- A specific diagnostic paper (e.g. "ESAT Maths II Set A", 27 questions, 40 min)
create table diagnostic_sets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  time_limit_minutes int not null,
  question_ids uuid[] not null,   -- ordered; defines question sequence
  is_free boolean default false,  -- powers your free-tier vs paid-tier split directly
  created_at timestamptz default now()
);

-- Individual questions — this is where your existing S1–S7 / topic-code tagging plugs in
create table diagnostic_questions (
  id uuid primary key default gen_random_uuid(),
  topic_code text not null,             -- e.g. 'MM1.6'
  core_skill_primary text not null,     -- e.g. 'S4'
  core_skill_secondary text,            -- nullable
  stem text not null,                   -- LaTeX source, $...$ delimited — see §9
  options jsonb not null,               -- [{label, text, is_correct, misconception}, ...] —
                                         -- each option carries its own correctness flag and
                                         -- wrong-answer explanation, so they travel together
  correct_option text not null,         -- denormalised copy of the correct label, for fast
                                         -- lookups without parsing the options array
  diagram_path text,                    -- path in the `diagnostic-content` Storage bucket,
                                         -- resolved to a signed URL at read time — mirrors the
                                         -- existing `questions` bucket pattern exactly (private,
                                         -- 1-hour signed URLs); see §5
  difficulty_tag text,                  -- 'creative' | 'TMUA-stretch' | null
  status text not null default 'draft', -- 'draft' | 'published' — see §9; only published
                                         -- questions are selectable into a diagnostic_set
  created_at timestamptz default now()
);

-- One student's attempt. student_id -> public.users(id) confirmed correct during Stage 1
-- by querying the live schema directly: user_info.user_id and user_question.user_id both
-- reference public.users(id) with ON DELETE CASCADE — matched here for the same reason
-- (a deleted user's exam history shouldn't be left as orphaned data). diagnostic_set_id
-- is left NO ACTION (the default) — deleting a set should never silently destroy the
-- attempt history taken against it.
create table diagnostic_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.users(id) on delete cascade,
  diagnostic_set_id uuid not null references diagnostic_sets(id),
  status text not null default 'in_progress',  -- in_progress|submitted|timed_out|abandoned
  started_at timestamptz not null default now(),
  server_deadline_at timestamptz not null,
  submitted_at timestamptz,
  agreed_to_terms boolean not null default false,
  total_score int,
  created_at timestamptz default now()
);

-- Postgres only auto-indexes primary keys and unique constraints, never plain FK
-- columns — both of these need an explicit index or every per-student and
-- per-set lookup does a full table scan once this table has real rows in it.
create index on diagnostic_attempts (student_id);
create index on diagnostic_attempts (diagnostic_set_id);

-- Per-question response + rolled-up timing (fast to read for the report).
-- attempt_id cascades (meaningless without its parent attempt); question_id is
-- NO ACTION, same reasoning as diagnostic_set_id above — never silently destroy
-- response history by deleting a question.
create table diagnostic_responses (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references diagnostic_attempts(id) on delete cascade,
  question_id uuid not null references diagnostic_questions(id),
  question_order_index int not null,
  selected_option text,
  is_correct boolean,
  total_time_seconds int not null default 0,
  view_count int not null default 0,      -- how many times they navigated back to it
  is_flagged boolean not null default false,
  updated_at timestamptz default now(),
  unique (attempt_id, question_id)
);

-- unique(attempt_id, question_id) above only gives a usable index when attempt_id
-- is the leftmost column being filtered on — question_id-only lookups (e.g. §6's
-- cohort-average-per-question queries: "all responses for this question across
-- every attempt") need their own separate index.
create index on diagnostic_responses (question_id);

-- Fine-grained event log — the raw material for time-management pattern analysis,
-- not just totals. This is what lets you answer "did they panic and rush the last 10
-- questions" rather than just "question 35 took 40 seconds." attempt_id cascades for
-- the same reason as diagnostic_responses; question_id is a real FK (NO ACTION) too —
-- an earlier draft of this table left question_id unconstrained, which would have let
-- a bug in event-ingestion code silently log against a question that doesn't exist.
create table diagnostic_question_events (
  id bigint generated always as identity primary key,
  attempt_id uuid not null references diagnostic_attempts(id) on delete cascade,
  question_id uuid not null references diagnostic_questions(id),
  event_type text not null,   -- enter|exit|flag|unflag|answer_change|blur|focus
  server_ts timestamptz not null default now(),
  client_ts timestamptz       -- stored for comparison/anomaly detection, never trusted alone
);

create index on diagnostic_question_events (attempt_id, server_ts);
-- No separate question_id index here: every described query pattern against this
-- table filters by attempt_id first (it's a per-session event log), which the index
-- above already covers. Add one later only if a genuine "all events for this
-- question, across every attempt" query pattern actually shows up.
```

**Row-Level Security — deliberately not the containment mechanism here.** The original draft of
this spec assumed RLS policies would lock `diagnostic_attempts`/`diagnostic_responses` to their
owning student. The audit found that's not how this stack actually works: RLS is enabled on
existing tables but has **zero policies** anywhere in the project, and even if policies existed,
the FastAPI backend connects to Supabase using the `service_role` key exclusively — which bypasses
RLS unconditionally, by design. Writing RLS policies for the new tables would produce exactly the
same decorative effect as the existing ones: present, enabled, doing nothing.

**The real containment mechanism is FastAPI's own route handlers** — every endpoint that touches
`diagnostic_attempts` or `diagnostic_responses` must explicitly check the requesting user's JWT
against `student_id` before returning or writing data, the same way ownership checks presumably
already happen elsewhere in `math-be` (worth confirming the existing pattern during Stage 1 and
matching it, rather than inventing a new one). Likewise, `correct_option` and each option's
`is_correct`/`misconception` fields must be stripped from the payload the frontend receives while
an attempt is `in_progress` — scored server-side, not filtered client-side — since there's no RLS
layer to fall back on if a route handler forgets. This is worth a shared helper function used by
every attempt-facing endpoint, rather than each handler re-implementing the strip-and-check logic.

RLS policies can still be added later as defense-in-depth — worth doing if this stack ever grows a
second DB client that connects as `anon`/`authenticated` rather than `service_role` (e.g. a future
mobile app talking to Supabase directly) — but they're not what's protecting anything today, and
Stage 1 shouldn't be written as though they are.

---

## 4. Timing & flagging capture — the actual mechanism

The event log (`diagnostic_question_events`) is the important design decision here. Don't just
store a `total_time_seconds` counter that increments client-side — that's fragile (tab switches,
laptop sleep, slow network) and gives you no pattern data. Instead:

1. Client fires an `enter` event the instant a question is displayed, and an `exit` event the
   instant it's navigated away from (including via the question navigator, not just Next/Prev).
2. Also fire `blur`/`focus` events on `document.visibilitychange` — this is what lets you later
   distinguish "spent 3 minutes genuinely stuck on this question" from "spent 3 minutes because
   they tabbed away to check something," which matters a lot for an honest time-management
   diagnosis.
3. Batch events client-side and flush every few seconds (or on each navigation) rather than one
   network call per event — keeps it snappy without hammering the FastAPI backend.
4. `total_time_seconds` in `diagnostic_responses` is then **computed server-side** from the event
   log (sum of `exit - enter` intervals, minus any `blur`→`focus` gaps) once the attempt is
   submitted — not trusted from the client directly. This also means you can re-derive it
   differently later if your definition of "time on task" evolves, without needing to re-collect
   data.
5. This event log is genuinely the valuable asset here, more than the rolled-up numbers — it's
   what eventually lets you build things like "students who flag a question and then don't return
   to it before time runs out" as its own pattern, which is a real and specific time-management
   failure mode worth being able to name to a parent.

**Workflow note specific to this codebase:** since the frontend talks to the backend exclusively
through a generated OpenAPI client (`src/client/` in `math-fe`), every new FastAPI endpoint this
section needs (event batch ingestion, attempt creation, submit) requires regenerating that client
afterward before the frontend can call it. Worth building the backend endpoints for a given stage
fully first, regenerating once, rather than regenerating repeatedly mid-stage.

---

## 5. Anti-copy layer — deterrence + traceability, honestly framed

As above: nothing here *prevents* a screenshot. The goal is (a) stop casual copy-paste/scraping
entirely, and (b) make anything that does leak traceable back to a specific student and attempt.

**Deterrence (stops casual copying, ~1 day of work):**
- `user-select: none` on question content; block copy/cut/context-menu via JS.
- Block `Ctrl/Cmd+P` and add a `@media print { .exam-content { display: none } }` rule as backup.
- Render question **diagrams** by reusing the existing `questions` bucket pattern exactly — a new
  private `diagnostic-content` bucket, diagrams uploaded through the admin tool, served only as
  signed URLs with a short expiry (the audit found the existing bucket uses 1 hour; worth matching
  that rather than inventing a different convention). This is arguably a stronger deterrent than
  my original inline-SVG idea — a saved signed URL goes dead after an hour, where inline SVG in
  the page source never expires. It's also zero new infrastructure, since `math-be` already has
  the signed-URL generation code for the `questions` bucket to draw from directly.
- Render question **stems and options as text with the deterrents above**, not as an image —
  keep them accessible/selectable-in-principle for legitimate use (e.g. a student using a screen
  reader), since going further than this (canvas-rendered text, etc.) starts trading real
  accessibility for a protection that a screenshot bypasses anyway. I'd draw the line here.
- Devtools-open detection (heuristic, imperfect) → log the event, don't try to block it outright.

**Traceability (the part that actually matters, ~1–2 days of work):**
- A subtle, semi-transparent diagonal watermark rendered over every question screen: student
  identifier and attempt ID, read from the same JWT-based identity already established at login
  (`public.users`, per the audit) — not a separate identity system. Generate it server-side per
  session so it's baked into what's shown, not something a client script could strip. This is
  standard practice for exam bodies and licensed question banks — it doesn't stop a screenshot,
  but it means a screenshot found circulating is traceable to exactly who took it and when.
- The pre-exam agreement checkbox (§1) gives you the contractual basis to act on what the
  watermark shows you.
- Optionally log `diagnostic_question_events` anomalies (e.g. implausibly fast navigation across
  many questions, consistent with scripted scraping rather than a human) as a soft fraud signal.

**Not worth building:** anything that tries to block PrintScreen or OS-level screenshot tools —
there's no web API that grants this level of control, and time spent chasing it won't move the
needle. Put that time into the watermarking instead.

---

## 6. Post-exam report — reuses what's already built

Once `diagnostic_responses` has `is_correct` per question, and each `diagnostic_questions` row
carries `core_skill_primary`/`secondary`, the Skills Radar report becomes a straightforward
aggregation:

```
for each S1–S7:
  score = (correct responses tagged with this skill, weighted primary + half-weight secondary)
        / (total responses tagged with this skill)
```

This is exactly the mock report structure already prototyped — the only new work is wiring real
`diagnostic_responses` rows into it instead of hand-written mock data. Worth also surfacing, using
the event log from §4:

- **Time-per-question vs. the cohort average** for that question (once you have enough attempts
  to have a cohort average) — this is what actually lets you diagnose a *time management* problem
  as distinct from a *knowledge* problem, which was the original ask.
- **Flagged-and-never-revisited** questions, called out explicitly — a concrete, nameable failure
  mode for the parent conversation.
- **Pacing curve**: time spent per question across the sequence, to spot "rushed the back third of
  the paper" patterns.

---

## 7. Product decisions — confirmed

- **Free vs. paid gates at the *set* level** (`diagnostic_sets.is_free`, as originally designed —
  no schema change needed). Some full papers free now; as the bank grows, new sets default to
  `is_free = false`. Simple flag flip per set, no code change needed to adjust the split later.
- **No pause/resume across sessions** — must complete in one sitting. One nuance worth deciding
  explicitly, since "can't pause" has two different implementations depending on how strictly you
  mean it:
  - **Option A (strict):** any tab close or navigation away immediately marks the attempt
    `abandoned` — no way back in at all, full stop.
  - **Option B (crash-tolerant):** the server clock never stops regardless of connection state;
    if the student reconnects before `server_deadline_at`, they land back in the exam exactly
    where the (still-ticking) clock says they should be. This isn't really "pausing" — time never
    stopped — it's just tolerating a refresh or network drop without punishing an accident.
  
  I'd default to **Option B**. It matches "you cannot pause the clock" literally, while not
  forfeiting a student's entire attempt over a dropped wifi connection — which is a genuine risk
  in a 60–90 minute browser session and would otherwise generate support headaches. This is a
  one-line policy difference in how "reconnect" is handled, not a structural change either way, so
  it's easy to flip later if Option A turns out to matter more to you in practice.
- **Retakes allowed, same `diagnostic_set`, new `diagnostic_attempts` row each time**, all old
  attempts stay queryable — this was already how §3 was structured, so no schema change. Worth
  adding explicitly to the report screen once there's more than one attempt: a simple "compare to
  last attempt" view showing the skill deltas, since that's a strong artifact for the parent
  conversation and is just a second read query against data you're already storing.

---

## 8. Audit — completed findings

The backend audit is done. Findings below; frontend audit still to run (see its checklist at the
end of this section — unchanged from before, still needed).

**1. Existing `questions`/`quiz` table?** Yes — `public.questions` already exists as part of the
SPM Math product: `id`, `created_at`, `question_url`/`answer_url` (Storage paths resolved to
signed URLs at read time), `difficulty` (free text), `paper_instance_id` (FK), `number`, `marks`,
`type` (enum, `default`/`multiple_choice`). Related: `question_option`, `question_topic`,
`user_question`; a content hierarchy of `syllabus → subjects → topics`,
`papers → paper_variants → paper_instances`. No separate ExamFlow table. **This is the direct
cause of the `diagnostic_` prefix throughout §3** — reusing or extending this table would mean
bending SPM Math's shape (built around `paper_instance_id` and Storage-rendered content) to fit a
genuinely different one (LaTeX stems, JSONB options, S1–S7 tags).

**2. Admin/role-based auth?** Exists as data, not as enforcement. `public.users.user_type` is a
real enum (`USER`/`ADMIN`, default `USER`), reflected in the Pydantic models — but nothing reads
it to gate anything. No `/admin`-prefixed router exists across any of the 8 routers registered in
`app/main.py`. Access control today is entirely: decode the bearer JWT, match against
`public.users`, nothing further. **This means Stage 2 isn't "wire into the existing admin
pattern" — it's building the first real enforcement of this flag from scratch**, as a FastAPI
dependency checked on every admin route, and it deserves its own review pass before any admin UI
is built on top of it (see §10, now its own stage).

**3. Supabase Storage?** Yes, one bucket: `questions` (private, created 2025-06-19), serving
per-question rendered HTML/SVG content exclusively via 1-hour signed URLs, never public URLs. No
other buckets. A `diagnostic-content` bucket for diagram uploads is new but follows an already
proven pattern — see §5.

**4. RLS conventions to follow?** None — and more importantly, RLS **does nothing at all** in
this stack currently. Enabled on nearly every table, zero policies exist anywhere, and the backend
connects via the `service_role` key, which bypasses RLS unconditionally regardless of what
policies might say. This is not a convention gap to fill in Stage 1 — it's a finding that changes
the spec's security model. See the full explanation and what actually replaces it in §3.

**5. GitHub + deployment?** `ClintonWeeYuan/math-be`, branches `main` and
`fix/critical-bugs-with-tests`. No `.github/` — no CI/CD at all. Deployed via Docker
(`Dockerfile` + `docker-compose.yml`) to Railway, fronted by `www.jomexam.com`. One Supabase
project (no `config.toml`, no local migrations directory, no branching). **The live production
database is the only database** — every migration needs testing against a throwaway local
Postgres or a manually-created Supabase branch first, since nothing else will catch a mistake
before it ships.

**Bonus finding — API routes vs. Edge Functions (resolved):** neither pattern exists, and neither
should be introduced. The frontend has `@supabase/supabase-js` listed as a dependency but zero
actual usage (`grep` across `src/` found no `createClient()` call and no rendered auth UI — the
only Supabase-related string in the frontend is one hardcoded, already-expired signed Storage URL,
clearly leftover sample data). The frontend talks exclusively to the FastAPI backend via a
generated OpenAPI client (`src/client/`). **Every server-authoritative piece of this spec —
deadline enforcement, scoring, admin-route gating — belongs in FastAPI**, the sole existing
pattern for anything server-side in this codebase.

**Filename correction:** the spec previously referenced `supabase/seed-data/esat-mathsii-set-a.json`
— the actual file is `esat_mathsii_bulk_import.json` (underscores). Corrected in §9.

No code was changed during this audit.

---

**Frontend repo audit — still to run, same idea, separate session:**

> Before we build anything, audit this codebase and report back — don't change any code yet.
> Specifically:
> 1. Is there an existing `/admin` area or any admin-gated pages, even partial or unused?
> 2. Is there any existing question-authoring UI, even partial or unused?
> 3. Is a LaTeX/math rendering library already a dependency (KaTeX, MathJax, react-katex, etc.)?
> 4. How does this app currently read the logged-in user's role/permissions (e.g. from the
>    OpenAPI client's response shape), so the future `/admin/questions` gate can reuse it rather
>    than inventing a second way to check the same thing?
> 5. Is this repo on GitHub? What's the deployment setup (Vercel, or something else)?
>
> Summarise findings before we decide anything else.

---

## 9. Content authoring / admin tool

This is new scope beyond the original ask, but it's the piece that makes everything else usable
day to day, so worth speccing properly rather than bolting on later.

**Prerequisite, not part of this feature — build first, review separately:** the audit found
`public.users.user_type` (`USER`/`ADMIN`) exists as data but is enforced nowhere in `math-be`. This
tool cannot be gated by "whatever role pattern already exists," because none does yet. The actual
first piece of work is a FastAPI dependency — something like `require_admin(user = Depends(get_current_user))`
that 403s unless `user_type == 'ADMIN'` — applied to every route this section describes. Treat
this as its own small, security-critical PR reviewed on its own, *before* any admin route or UI is
built on top of it, not bundled into the same change. Getting this wrong silently (e.g. checking
the role client-side only) would let any authenticated user hit admin endpoints directly.

**Route & access:** an isolated `/admin/questions` area in the frontend repo (`math-fe`), calling
FastAPI endpoints in the backend repo (`math-be`) that are gated by the dependency above. The
frontend-side check is a UX nicety (hide the nav link, redirect if not admin) — the enforcement
that actually matters is server-side. Deliberately not linked from any student-facing navigation.

**Question form fields:**
- Topic code (e.g. `MM1.6`) — dropdown, sourced from a small reference table rather than
  hardcoded, so adding a new topic later doesn't need a code change.
- Core skill primary / secondary (`S1`–`S7`) — same pattern.
- Difficulty tag — `creative` / `TMUA-stretch` / none.
- Stem — a LaTeX-enabled text field (e.g. typed as `Given that $x^2 + kx + 9 = 0$ has equal
  roots...`), rendered live via **KaTeX** (lighter and faster than MathJax, and the standard choice
  for this kind of content) in a preview pane right next to the input, so you see exactly what a
  student will see before publishing — not a separate, possibly-inconsistent preview
  implementation, but the *same* rendering component the exam screen itself uses.
- Options (A–E, or more — see the ESAT Maths II set's Q13 for a real 7-option case), same
  LaTeX-enabled treatment, correct-option selector, plus a free-text misconception field per
  incorrect option.
- Diagram — upload an image file (or paste an SVG, which is how the current question bank's
  diagrams were generated via matplotlib) to the new `diagnostic-content` Storage bucket, mirroring
  exactly how the existing `questions` bucket already handles this (private bucket, signed URL
  generated at read time). No new infrastructure pattern — reuses working code.
- Status — `draft` / `published`, so a half-finished question never risks appearing in a live
  diagnostic set. Only `published` questions should be selectable when assembling a
  `diagnostic_sets.question_ids` list.

**Bulk import (worth prioritising early):** you already have ~100 fully-authored, verified MM1/MM8
questions from earlier batches, plus a fully tagged and verified 27-question ESAT Maths II paper —
each with a consistent structure: stem, options, correct answer, topic code, primary/secondary
skill, misconception notes per option. Re-keying all of that through a one-at-a-time web form would
be a lot of wasted effort. A JSON bulk-import path (admin uploads a file matching a defined schema,
system validates and inserts as `draft` rows for review) is a small addition to the form-based tool
and saves that entire re-entry pass. **The ESAT Maths II set is already converted** —
`supabase/seed-data/esat_mathsii_bulk_import.json` in the backend repo (note the filename uses
underscores, not the hyphenated name earlier drafts of this spec used) — built against exactly the
`diagnostic_questions` shape in §3: each option carries its own `is_correct` and `misconception`
fields, so an option and its explanation travel together. Use it as the real test case when
building the import path in Stage 2, rather than a synthetic one.

**Longer-term note, not needed now:** once questions live in the database with LaTeX source
rather than only in Word documents, that database becomes the single source of truth — the
existing docx question-bank workflow could eventually be regenerated *from* it (a script that
pulls published questions and renders them into the same docx format already in use), rather than
maintaining the Word docs and the database as two separate, divergent copies of the same content.
Not a Phase 1 concern, but worth knowing the door is open.

---

## 10. Staged build plan for production safety

The core principle, stated plainly: **every new table, route, and component in this spec is
strictly additive** — new files, new tables, nothing that edits or depends on existing
student-facing code paths. That's not just a nice-to-have, it's what makes the staging below
actually safe rather than just cautious-sounding: if nothing here touches existing tables or
routes, a bug in the new diagnostic platform *cannot* by construction break tutoring bookings, the
SPM Math product, or anything else already live. The `diagnostic_` table prefix (§3) and the fact
that server logic goes through FastAPI, the codebase's one existing server-side pattern, are both
in service of this same principle.

Practically, ask Claude Code to work in a **git worktree on a feature branch**, committing and
opening a **draft pull request** rather than pushing to `main` — this is built into how Claude
Code's background/agent workflow already operates, so it's a matter of asking for it, not building
tooling for it. This applies **per repo** — two branches, two PRs, reviewed independently. You (or
your technical collaborator) review both before anything merges. This matters more than usual
here specifically because **there is no CI and no staging environment** — a merged PR goes
straight to the one production database and the Railway deployment. Treat local/manual testing
before merge as the only safety net that exists, because it is.

| Stage | What happens | Repo(s) | Exposure |
|---|---|---|---|
| **0. Audit** | §8 — backend complete, frontend checklist still to run | Backend done; Frontend next | none — no code changes |
| **1. Schema** ✅ | New `diagnostic_`-prefixed tables from §3, as a raw SQL migration, tested against a throwaway local Postgres. **Complete and merged** — three review rounds: added three missing FK indexes (Postgres doesn't auto-index FK columns); caught and fixed a missing FK entirely on `diagnostic_question_events.question_id`; deliberately declined a further index on that same column — it's the highest-write-volume table in the schema with no described query pattern that needs one, unlike the other three | Backend (`math-be`) | none — no UI yet, tables empty |
| **2. Admin auth enforcement** ✅ | The `require_admin` FastAPI dependency from §9. **Complete and merged** — plain-string comparison against `user_type` (confirmed no enum anywhere in the codebase, no mismatch risk); confirmed fresh-from-DB on every request, not JWT-embedded, so revoking admin access takes effect on the very next request; review caught that the original tests called the dependency directly and never actually resolved the `Depends()` chain, missing a real distinction (missing header → 403 from `HTTPBearer` itself; invalid token → 401 from existing logic) — fixed with full-chain `TestClient` tests before merge. Deliberately wired into **zero routes** — that's Stage 3 | Backend (`math-be`) | none — no routes depend on it yet |
| **3. Admin tool** | §9's CRUD + bulk-import endpoints (backend) and the `/admin/questions` UI with KaTeX preview (frontend), gated by Stage 2. Test the bulk-import path against the real `esat_mathsii_bulk_import.json`, not a synthetic file | Backend + Frontend (`math-fe`) | you only |
| **4. Exam-taking UI** | §2 + §4 — attempt-creation, deadline-check, and event-ingestion endpoints (backend), the exam screen itself (frontend), reachable only via a direct unlisted URL, tested against the ESAT Maths II 27-question set | Backend + Frontend | you + family/collaborator only |
| **5. Scoring + report** | §6 — server-side scoring that never leaks `correct_option` mid-attempt (backend), the Skills Radar report screen (frontend), tested end-to-end against the Stage 4 test attempts | Backend + Frontend | you + family/collaborator only |
| **6. Anti-copy layer** | §5 — signed-URL diagram serving and watermark data (backend), copy/print deterrents and watermark rendering (frontend). Added last since it's the most likely source of false-positive UX bugs and is easiest to debug once the core flow is already proven stable | Backend + Frontend | you + family/collaborator only |
| **7. Soft launch** | Link the diagnostic from the real site, but only to a small controlled group — existing students, or one agent's referrals | Frontend | limited real users |
| **8. Public launch** | Linked from main navigation | Frontend | everyone |

Each stage should be small enough to review in one sitting before moving to the next — that's the
actual point of staging, more than the specific boundaries drawn above. If a stage starts feeling
too big to review confidently in one pass, that's the signal to split it further, not push through.

**Starting next:** Stage 2 is done. Stage 3 (the admin tool itself, §9) is next in `math-be` +
`math-fe` together — the CRUD and bulk-import endpoints now have `require_admin` to gate them
against, and the bulk-import path should be tested against the real
`esat_mathsii_bulk_import.json`, not a synthetic file. Worth checking first whether the frontend
half of Stage 0 (checklist at the end of §8) has run yet — if not, do that first in a `math-fe`
session, since Stage 3's frontend work depends on knowing what's already there (existing LaTeX
libraries, any partial admin UI) more than Stage 1 or 2 did.

