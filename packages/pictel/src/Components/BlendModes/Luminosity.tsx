import type { ComponentPropsWithoutRef, ReactNode } from "react"

interface LuminosityProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number
	children?: ReactNode
}

export function Luminosity({ opacity, children, style, ...rest }: LuminosityProps) {
	return (
		<div {...rest} style={{ ...style, mixBlendMode: "luminosity", opacity }}>
			{children}
		</div>
	)
}
