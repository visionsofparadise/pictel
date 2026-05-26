# Cel Shade

A cel-shaded portrait in the language of stylised animation key frames. Smooth tonal transitions collapse into a handful of flat colour bands — bright highlights, mid-tones, and a single shadow band — pooled across the face and clothing. Inked outlines snap to the strongest edges: jaw, brow, the bridge of the nose, the boundary between skin and shirt. The result reads less like a photograph and more like a frame held mid-cut, the moment after the inker has gone over the colourist's work.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/cel-shade.png)

```tsx
import { Bilateral, LuminanceBands, Multiply, Outline, Saturate, Threshold } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const HEADSHOT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const canvasW = 512;
const canvasH = 512;

export default function CelShade() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<Multiply
				apply={
					<Threshold threshold={140}>
						<Outline sigma={2.6} k={1.6} epsilon={0.005} phi={200}>
							<Image src={HEADSHOT_URL} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />
						</Outline>
					</Threshold>
				}
			>
				<Saturate amount={1.5}>
					<LuminanceBands bands={3}>
						<Bilateral spatialSigma={4} colorSigma={45}>
							<Image src={HEADSHOT_URL} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />
						</Bilateral>
					</LuminanceBands>
				</Saturate>
			</Multiply>
		</Canvas>
	);
}
```
