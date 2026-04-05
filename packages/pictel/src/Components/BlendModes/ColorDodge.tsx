import type { ComponentPropsWithoutRef, ReactNode } from "react"

interface ColorDodgeProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number
	children?: ReactNode
}

export function ColorDodge({ opacity, children, style, ...rest }: ColorDodgeProps) {
	return (
		<div {...rest} style={{ ...style, mixBlendMode: "color-dodge", opacity }}>
			{children}
		</div>
	)
}
