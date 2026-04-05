import type { ComponentPropsWithoutRef, ReactNode } from "react"

interface ScreenProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number
	children?: ReactNode
}

export function Screen({ opacity, children, style, ...rest }: ScreenProps) {
	return (
		<div {...rest} style={{ ...style, mixBlendMode: "screen", opacity }}>
			{children}
		</div>
	)
}
