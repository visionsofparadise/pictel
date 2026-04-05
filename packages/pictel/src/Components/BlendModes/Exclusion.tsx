import type { ComponentPropsWithoutRef, ReactNode } from "react"

interface ExclusionProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number
	children?: ReactNode
}

export function Exclusion({ opacity, children, style, ...rest }: ExclusionProps) {
	return (
		<div {...rest} style={{ ...style, mixBlendMode: "exclusion", opacity }}>
			{children}
		</div>
	)
}
