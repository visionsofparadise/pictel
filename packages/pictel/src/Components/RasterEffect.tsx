import { useState, type ReactNode, type ComponentPropsWithoutRef } from "react";
import { useRaster } from "../hooks/useRaster";
import { PixelCanvas } from "./PixelCanvas";

type RasterEffectProps = {
	effect: (children: ImageData) => ImageData | Promise<ImageData>;
	children: ReactNode;
} & ComponentPropsWithoutRef<"div">;

export function RasterEffect({ effect, children, ...rest }: RasterEffectProps) {
	const [result, setResult] = useState<ImageData | null>(null);
	const [prevEffect, setPrevEffect] = useState(() => effect);

	if (prevEffect !== effect) {
		setPrevEffect(() => effect);
		setResult(null);
	}

	const ref = useRaster(async (childPixels) => {
		setResult(await effect(childPixels));
	});

	if (result !== null) {
		return <PixelCanvas data={result} />;
	}

	return (
		<div ref={ref} {...rest}>
			{children}
		</div>
	);
}
