import type { ComponentPropsWithoutRef, ReactNode } from "react"

interface DropShadowProps extends ComponentPropsWithoutRef<"div"> {
	offsetX: number
	offsetY: number
	blurRadius: number
	color: string
	children?: ReactNode
}

export function DropShadow({ offsetX, offsetY, blurRadius, color, children, style, ...rest }: DropShadowProps) {
	return (
		<div {...rest} style={{ ...style, filter: `drop-shadow(${offsetX}px ${offsetY}px ${blurRadius}px ${color})` }}>
			{children}
		</div>
	)
}
