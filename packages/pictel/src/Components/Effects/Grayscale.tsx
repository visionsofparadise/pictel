import type { ComponentPropsWithoutRef, ReactNode } from "react"

interface GrayscaleProps extends ComponentPropsWithoutRef<"div"> {
	amount?: number
	children?: ReactNode
}

export function Grayscale({ amount = 1, children, style, ...rest }: GrayscaleProps) {
	return (
		<div {...rest} style={{ ...style, filter: `grayscale(${amount})` }}>
			{children}
		</div>
	)
}
