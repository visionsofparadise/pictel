import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useCallback } from "react";
import { RasterEffect } from "../../RasterEffect";
import { applyUniformBlur } from "./utils/uniform-blur";
import { applyVariableBlur } from "./utils/variable-blur";

export interface BlurProps extends ComponentPropsWithoutRef<"div"> {
	radius: number;
	mode?: "parameter" | "mix";
	backdrop?: boolean;
	flatten?: boolean;
	children?: ReactNode;
}

export function Blur({ radius, mode = "parameter", backdrop, flatten, children, ...rest }: BlurProps) {
	const effect = useCallback(
		(pixels: ImageData) => applyUniformBlur(pixels, radius),
		[radius],
	);

	const mappedEffect = useCallback(
		(pixels: ImageData, map: ImageData) => applyVariableBlur(pixels, map, radius),
		[radius],
	);

	return (
		<RasterEffect
			effect={effect}
			mappedEffect={mappedEffect}
			mode={mode}
			backdrop={backdrop}
			flatten={flatten}
			{...rest}
		>
			{children}
		</RasterEffect>
	);
}
