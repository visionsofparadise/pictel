import type { ComponentPropsWithoutRef, ReactNode } from "react"

interface LightenProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number
	children?: ReactNode
}

export function Lighten({ opacity, children, style, ...rest }: LightenProps) {
	return (
		<div {...rest} style={{ ...style, mixBlendMode: "lighten", opacity }}>
			{children}
		</div>
	)
}
