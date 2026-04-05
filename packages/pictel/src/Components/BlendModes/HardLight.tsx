import type { ComponentPropsWithoutRef, ReactNode } from "react"

interface HardLightProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number
	children?: ReactNode
}

export function HardLight({ opacity, children, style, ...rest }: HardLightProps) {
	return (
		<div {...rest} style={{ ...style, mixBlendMode: "hard-light", opacity }}>
			{children}
		</div>
	)
}
