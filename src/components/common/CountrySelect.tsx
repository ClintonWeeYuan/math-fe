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
import { COUNTRIES, countryName } from '@/lib/countries.ts'
import { cn } from '@/lib/utils.ts'

type Props = {
    value: string | null | undefined
    onChange: (code: string) => void
    id?: string
    disabled?: boolean
    'aria-labelledby'?: string
}

/**
 * Pick a country by typing its name. A plain select would mean scrolling
 * through two hundred and fifty entries; the shared Combobox would accept a
 * typed value that is not a country, which is exactly what the stored code is
 * there to prevent.
 */
export function CountrySelect({ value, onChange, id, disabled, ...rest }: Props) {
    const [open, setOpen] = useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    id={id}
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    aria-labelledby={rest['aria-labelledby']}
                    disabled={disabled}
                    className="w-full justify-between font-normal"
                >
                    <span className={cn(!value && 'text-gray-400')}>
                        {value ? countryName(value) : 'Select your country'}
                    </span>
                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                    <CommandInput placeholder="Search countries…" />
                    <CommandList>
                        <CommandEmpty>No country matches.</CommandEmpty>
                        <CommandGroup>
                            {COUNTRIES.map((c) => (
                                <CommandItem
                                    key={c.code}
                                    // cmdk filters on this, so it is the name.
                                    value={c.name}
                                    onSelect={() => {
                                        onChange(c.code)
                                        setOpen(false)
                                    }}
                                >
                                    {c.name}
                                    {value === c.code && (
                                        <Check className="ml-auto h-4 w-4" />
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
