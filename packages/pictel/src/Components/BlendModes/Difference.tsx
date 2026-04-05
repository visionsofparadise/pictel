import type { ComponentPropsWithoutRef, ReactNode } from "react"

interface DifferenceProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number
	children?: ReactNode
}

export function Difference({ opacity, children, style, ...rest }: DifferenceProps) {
	return (
		<div {...rest} style={{ ...style, mixBlendMode: "difference", opacity }}>
			{children}
		</div>
	)
}
