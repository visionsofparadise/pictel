import type { ComponentPropsWithoutRef, ReactNode } from "react"

interface BrightnessProps extends ComponentPropsWithoutRef<"div"> {
	amount?: number
	children?: ReactNode
}

export function Brightness({ amount = 1, children, style, ...rest }: BrightnessProps) {
	return (
		<div {...rest} style={{ ...style, filter: `brightness(${amount})` }}>
			{children}
		</div>
	)
}
