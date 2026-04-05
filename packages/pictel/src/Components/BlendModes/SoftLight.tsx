import type { ComponentPropsWithoutRef, ReactNode } from "react"

interface SoftLightProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number
	children?: ReactNode
}

export function SoftLight({ opacity, children, style, ...rest }: SoftLightProps) {
	return (
		<div {...rest} style={{ ...style, mixBlendMode: "soft-light", opacity }}>
			{children}
		</div>
	)
}
