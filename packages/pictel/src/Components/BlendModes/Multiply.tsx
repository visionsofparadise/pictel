import type { ComponentPropsWithoutRef, ReactNode } from "react"

interface MultiplyProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number
	children?: ReactNode
}

export function Multiply({ opacity, children, style, ...rest }: MultiplyProps) {
	return (
		<div {...rest} style={{ ...style, mixBlendMode: "multiply", opacity }}>
			{children}
		</div>
	)
}
