import type { ComponentPropsWithoutRef, ReactNode } from "react"

interface ColorProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number
	children?: ReactNode
}

export function Color({ opacity, children, style, ...rest }: ColorProps) {
	return (
		<div {...rest} style={{ ...style, mixBlendMode: "color", opacity }}>
			{children}
		</div>
	)
}
