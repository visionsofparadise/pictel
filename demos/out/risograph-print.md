# Risograph Print

A portrait reduced to a four-ink risograph palette — paper-cream, hot fluorescent pink, deep ink blue, and near-black — with a coarse ordered halftone pattern carrying the missing tones across the surface. Up close the dither is plainly visible as a stipple of the four inks; at a viewing distance the eye fuses them into the implied midtones. The constrained palette and visible screen pattern are the look — the modern zine and print-fair aesthetic of a Riso duplicator stencil run.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/portrait-with-background-1.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/risograph-print.png)

```tsx
import { Quantize } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/portrait-with-background-1.jpg";

const W = 1024;
const H = 1536;

const RISO_PALETTE = [
	[245, 240, 230],
	[235, 60, 130],
	[40, 80, 180],
	[35, 35, 40],
] as const;

export default function RisographPrint() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Quantize palette={RISO_PALETTE} dither="bayer-8">
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</Quantize>
		</Canvas>
	);
}
```
