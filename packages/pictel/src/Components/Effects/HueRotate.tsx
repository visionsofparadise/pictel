import type { ComponentPropsWithoutRef, ReactNode } from "react"

interface HueRotateProps extends ComponentPropsWithoutRef<"div"> {
	angle: number
	children?: ReactNode
}

export function HueRotate({ angle, children, style, ...rest }: HueRotateProps) {
	return (
		<div {...rest} style={{ ...style, filter: `hue-rotate(${angle}deg)` }}>
			{children}
		</div>
	)
}
