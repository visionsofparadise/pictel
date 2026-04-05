import type { ComponentPropsWithoutRef, ReactNode } from "react"

interface NormalProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number
	children?: ReactNode
}

export function Normal({ opacity, children, style, ...rest }: NormalProps) {
	return (
		<div {...rest} style={{ ...style, mixBlendMode: "normal", opacity }}>
			{children}
		</div>
	)
}
