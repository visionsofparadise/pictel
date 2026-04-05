import type { ComponentPropsWithoutRef, ReactNode } from "react"

interface SaturationProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number
	children?: ReactNode
}

export function Saturation({ opacity, children, style, ...rest }: SaturationProps) {
	return (
		<div {...rest} style={{ ...style, mixBlendMode: "saturation", opacity }}>
			{children}
		</div>
	)
}
