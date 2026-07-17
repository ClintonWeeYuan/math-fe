import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command.tsx'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover.tsx'
import { cn } from '@/lib/utils.ts'

type Props = {
    value: string | null
    onChange: (value: string | null) => void
    options: readonly string[]
    placeholder?: string
    searchPlaceholder?: string
    /** Offers an explicit "clear" entry (e.g. uncategorise a set). */
    clearLabel?: string
    id?: string
}

/**
 * A pick-from-known-values-or-type-a-new-one input.
 *
 * Both places this is used (a set's subject, a question's topic code) have
 * the same shape of problem: a list that's known-but-growing. A plain text
 * input invites typos that silently mis-tag content; a hard <Select> means
 * a new subject or topic can't be added without a code change. This offers
 * the existing values first and still accepts a new one, so the common case
 * is a click and the new case isn't blocked.
 */
export function Combobox({
    value,
    onChange,
    options,
    placeholder = 'Select…',
    searchPlaceholder = 'Search or type a new one…',
    clearLabel,
    id,
}: Props) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')

    const trimmed = search.trim()
    const isExisting = options.some(
        (o) => o.toLowerCase() === trimmed.toLowerCase()
    )

    function select(next: string | null) {
        onChange(next)
        setSearch('')
        setOpen(false)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    id={id}
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal"
                >
                    <span className={cn(!value && 'text-gray-400')}>
                        {value ?? placeholder}
                    </span>
                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                    <CommandInput
                        placeholder={searchPlaceholder}
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList>
                        <CommandEmpty>Nothing matches.</CommandEmpty>
                        <CommandGroup>
                            {clearLabel && (
                                <CommandItem
                                    value={clearLabel}
                                    onSelect={() => select(null)}
                                >
                                    <span className="text-gray-500">{clearLabel}</span>
                                    {value === null && (
                                        <Check className="ml-auto h-4 w-4" />
                                    )}
                                </CommandItem>
                            )}
                            {options.map((option) => (
                                <CommandItem
                                    key={option}
                                    value={option}
                                    onSelect={() => select(option)}
                                >
                                    {option}
                                    {value === option && (
                                        <Check className="ml-auto h-4 w-4" />
                                    )}
                                </CommandItem>
                            ))}
                            {/* Free entry: only when what's typed isn't already
                                an option, so it can't shadow an exact match. */}
                            {trimmed !== '' && !isExisting && (
                                <CommandItem
                                    value={trimmed}
                                    onSelect={() => select(trimmed)}
                                >
                                    Use “{trimmed}”
                                </CommandItem>
                            )}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
