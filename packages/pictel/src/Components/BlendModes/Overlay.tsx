import type { ComponentPropsWithoutRef, ReactNode } from "react"

interface OverlayProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number
	children?: ReactNode
}

export function Overlay({ opacity, children, style, ...rest }: OverlayProps) {
	return (
		<div {...rest} style={{ ...style, mixBlendMode: "overlay", opacity }}>
			{children}
		</div>
	)
}
