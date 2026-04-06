import { useState, type ReactNode, type ComponentPropsWithoutRef } from "react";
import { useComposite } from "../hooks/useComposite";
import { PixelCanvas } from "./PixelCanvas";

type CompositeEffectProps = {
	effect: (self: ImageData, behind: ImageData) => ImageData | Promise<ImageData>;
	children: ReactNode;
} & ComponentPropsWithoutRef<"div">;

export function CompositeEffect({ effect, children, ...rest }: CompositeEffectProps) {
	const [result, setResult] = useState<ImageData | null>(null);
	const [prevEffect, setPrevEffect] = useState(() => effect);

	if (prevEffect !== effect) {
		setPrevEffect(() => effect);
		setResult(null);
	}

	const ref = useComposite(async (self, behind) => {
		setResult(await effect(self, behind));
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
