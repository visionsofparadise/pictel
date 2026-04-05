import type { ComponentPropsWithoutRef, ReactNode } from "react";

interface ColorBurnProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number;
	children?: ReactNode;
}

export function ColorBurn({ opacity, children, style, ...rest }: ColorBurnProps) {
	return (
		<div
			{...rest}
			style={{ ...style, mixBlendMode: "color-burn", opacity }}
		>
			{children}
		</div>
	);
}
