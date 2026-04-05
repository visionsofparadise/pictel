import type { ComponentPropsWithoutRef, ReactNode } from "react"

interface HueProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number
	children?: ReactNode
}

export function Hue({ opacity, children, style, ...rest }: HueProps) {
	return (
		<div {...rest} style={{ ...style, mixBlendMode: "hue", opacity }}>
			{children}
		</div>
	)
}
