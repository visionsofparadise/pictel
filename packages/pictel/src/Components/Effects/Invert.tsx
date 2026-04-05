import type { ComponentPropsWithoutRef, ReactNode } from "react"

interface InvertProps extends ComponentPropsWithoutRef<"div"> {
	amount?: number
	children?: ReactNode
}

export function Invert({ amount = 1, children, style, ...rest }: InvertProps) {
	return (
		<div {...rest} style={{ ...style, filter: `invert(${amount})` }}>
			{children}
		</div>
	)
}
