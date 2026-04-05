import type { ComponentPropsWithoutRef, ReactNode } from "react"

interface SepiaProps extends ComponentPropsWithoutRef<"div"> {
	amount?: number
	children?: ReactNode
}

export function Sepia({ amount = 1, children, style, ...rest }: SepiaProps) {
	return (
		<div {...rest} style={{ ...style, filter: `sepia(${amount})` }}>
			{children}
		</div>
	)
}
