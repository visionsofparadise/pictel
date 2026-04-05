import type { ComponentPropsWithoutRef, ReactNode } from "react"

interface OpacityProps extends ComponentPropsWithoutRef<"div"> {
	amount?: number
	children?: ReactNode
}

export function Opacity({ amount = 1, children, style, ...rest }: OpacityProps) {
	return (
		<div {...rest} style={{ ...style, filter: `opacity(${amount})` }}>
			{children}
		</div>
	)
}
