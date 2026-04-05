import type { ComponentPropsWithoutRef, ReactNode } from "react"

interface BlurProps extends ComponentPropsWithoutRef<"div"> {
	radius: number
	children?: ReactNode
}

export function Blur({ radius, children, style, ...rest }: BlurProps) {
	return (
		<div {...rest} style={{ ...style, filter: `blur(${radius}px)` }}>
			{children}
		</div>
	)
}
