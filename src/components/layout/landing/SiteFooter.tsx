import { Link } from 'react-router-dom'

/**
 * The site footer, which until now did not exist.
 *
 * Added because the legal pages need a home. A privacy notice nobody can find
 * from the site is a privacy notice in name only, and the footer is where a
 * reader looks for one — before signing up, not after, which is the moment the
 * signup notice's own link is too late for.
 *
 * Deliberately plain: this sits under every landing page and its job is to be
 * findable, not to be noticed.
 */
export function SiteFooter() {
    return (
        <footer className="mt-20 border-t border-slate-200">
            <div className="px-4 md:px-[50px] xl:px-[150px] py-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                    © {new Date().getFullYear()} JomExam
                </p>
                <nav className="flex flex-wrap gap-x-6 gap-y-2">
                    <Link
                        to="/about"
                        className="text-sm text-slate-500 underline underline-offset-4 hover:text-slate-900"
                    >
                        About
                    </Link>
                    <Link
                        to="/guides"
                        className="text-sm text-slate-500 underline underline-offset-4 hover:text-slate-900"
                    >
                        Guides
                    </Link>
                    <Link
                        to="/terms"
                        className="text-sm text-slate-500 underline underline-offset-4 hover:text-slate-900"
                    >
                        Terms of Use
                    </Link>
                </nav>
            </div>
        </footer>
    )
}
