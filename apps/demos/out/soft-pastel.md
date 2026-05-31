# Soft Pastel

A portrait lifted into a pastel-watercolour register — the high-frequency detail (skin pores, fabric weave, leaf stipple in the background) smoothed away, contrast pulled gently down so nothing reaches deep black, saturation reduced so every hue sits a notch softer than reality, and the whole frame nudged a touch warmer and brighter. The structure of the photograph is intact — the subject still recognisable, the composition still readable — but the surface has been quieted, the way a memory of a photograph is softer than the photograph itself. The result is the kind of mood-board pastel a magazine designer would commission for a perfume ad.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/soft-pastel.png)

```tsx
import { Bilateral, ColorGrade } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg";

const W = 1024;
const H = 1536;

export default function SoftPastel() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<ColorGrade brightness={1.1} contrast={0.85} saturation={0.7} temperature={0.05} tint={0.04}>
				<Bilateral spatialSigma={5} colorSigma={45}>
					<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
				</Bilateral>
			</ColorGrade>
		</Canvas>
	);
}
```
