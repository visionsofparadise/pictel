import type { ComponentPropsWithoutRef, ReactNode } from "react"

interface SaturateProps extends ComponentPropsWithoutRef<"div"> {
	amount?: number
	children?: ReactNode
}

export function Saturate({ amount = 1, children, style, ...rest }: SaturateProps) {
	return (
		<div {...rest} style={{ ...style, filter: `saturate(${amount})` }}>
			{children}
		</div>
	)
}
