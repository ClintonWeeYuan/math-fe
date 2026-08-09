import * as React from 'react'
import * as Mathlive from 'mathlive'
import { useRef } from 'react'

type CustomElement<T> = Partial<T & React.DOMAttributes<T>>

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            'math-field': CustomElement<Mathlive.MathfieldElementAttributes>
        }
    }
}

export interface IMathfieldProps {
    value: string
    options?: Partial<Mathlive.MathfieldOptions>
    onChange?: (value: string) => void
    style?: React.HTMLAttributes<HTMLDivElement>['style']
}

Mathlive.MathfieldElement.locale = 'en'
Mathlive.MathfieldElement.decimalSeparator = ','
Mathlive.MathfieldElement.keypressSound = 'none'
Mathlive.MathfieldElement.plonkSound = 'none'

export default function Mathfield(props: IMathfieldProps) {
    const mathfield = useRef<Mathlive.MathfieldElement>(null)
    const onInput = () => props.onChange?.(mathfield.current?.getValue() || '')
    const { style } = props
    const divStyle = {
        ...style,
    }

    const init = (mf: Mathlive.MathfieldElement | null) => {
        if (mf) {
            mathfield.current = mf
        }
    }

    // @ts-expect-error Ignore this
    return <math-field ref={init} onInput={onInput} style={divStyle} />
}
