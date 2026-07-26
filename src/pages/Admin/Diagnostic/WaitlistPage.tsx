import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { AdminLayout } from '@/components/layout/AdminLayout.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table.tsx'
import useListWaitlistQuery from '@/hooks/diagnostic/useListWaitlistQuery.ts'
import { downloadWaitlistCsv } from '@/lib/waitlistCsv.ts'

/** Human labels for the products the backend accepts. Unknown values still
 * render (as their raw slug) so a product added server-side is never hidden. */
const PRODUCT_LABELS: Record<string, string> = {
    tmua: 'TMUA',
    'esat-chemistry': 'ESAT Chemistry',
    'esat-biology': 'ESAT Biology',
}

function label(product: string): string {
    return PRODUCT_LABELS[product] ?? product
}

/**
 * Admin waitlist screen: who has asked to be told when an upcoming product
 * opens, filterable by product, with a CSV export to paste into an email
 * tool on launch day. Read-only — signups arrive from the public form.
 */
export function WaitlistPage() {
    const { data, isLoading, isError, error } = useListWaitlistQuery()
    const [product, setProduct] = useState<string | null>(null)

    const entries = data ?? []

    /** Signup counts per product, for the filter chips. */
    const counts = useMemo(() => {
        const by = new Map<string, number>()
        for (const e of entries) by.set(e.product, (by.get(e.product) ?? 0) + 1)
        return [...by.entries()].sort(([a], [b]) => a.localeCompare(b))
    }, [entries])

    const shown = product
        ? entries.filter((e) => e.product === product)
        : entries

    return (
        <AdminLayout>
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-2xl font-bold">Waitlist</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Students waiting to hear when an upcoming product
                            opens. Export the list to email them on launch.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        className="cursor-pointer"
                        disabled={shown.length === 0}
                        onClick={() => downloadWaitlistCsv(shown)}
                    >
                        <Download className="h-4 w-4" /> Export CSV
                    </Button>
                </div>

                {/* Product filter — the counts double as the at-a-glance
                    demand signal for what to build next. */}
                {counts.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <Button
                            variant={product === null ? 'default' : 'outline'}
                            size="sm"
                            className="cursor-pointer"
                            onClick={() => setProduct(null)}
                        >
                            All <Badge variant="secondary">{entries.length}</Badge>
                        </Button>
                        {counts.map(([p, n]) => (
                            <Button
                                key={p}
                                variant={product === p ? 'default' : 'outline'}
                                size="sm"
                                className="cursor-pointer"
                                onClick={() => setProduct(p)}
                            >
                                {label(p)} <Badge variant="secondary">{n}</Badge>
                            </Button>
                        ))}
                    </div>
                )}

                {isLoading && <p className="text-gray-500">Loading…</p>}

                {isError && (
                    <p className="text-red-600 text-sm">
                        Could not load the waitlist: {error?.message}
                    </p>
                )}

                {!isLoading && !isError && entries.length === 0 && (
                    <p className="text-gray-500">
                        No signups yet. They arrive from the waitlist form on
                        the admissions pages.
                    </p>
                )}

                {shown.length > 0 && (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Signed up</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {shown.map((e) => (
                                <TableRow key={`${e.email}-${e.product}`}>
                                    <TableCell className="font-medium">
                                        {e.email}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">
                                            {label(e.product)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-gray-500">
                                        {e.createdAt.slice(0, 16).replace('T', ' ')}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </AdminLayout>
    )
}
