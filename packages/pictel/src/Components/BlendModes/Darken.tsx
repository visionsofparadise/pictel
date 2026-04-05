import type { ComponentPropsWithoutRef, ReactNode } from "react"

interface DarkenProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number
	children?: ReactNode
}

export function Darken({ opacity, children, style, ...rest }: DarkenProps) {
	return (
		<div {...rest} style={{ ...style, mixBlendMode: "darken", opacity }}>
			{children}
		</div>
	)
}
