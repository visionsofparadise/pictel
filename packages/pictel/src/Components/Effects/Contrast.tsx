import type { ComponentPropsWithoutRef, ReactNode } from "react"

interface ContrastProps extends ComponentPropsWithoutRef<"div"> {
	amount?: number
	children?: ReactNode
}

export function Contrast({ amount = 1, children, style, ...rest }: ContrastProps) {
	return (
		<div {...rest} style={{ ...style, filter: `contrast(${amount})` }}>
			{children}
		</div>
	)
}
