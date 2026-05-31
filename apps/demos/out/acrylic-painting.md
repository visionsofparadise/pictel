# Acrylic Painting

A landscape worked over as if rendered in thick acrylic paint — broad areas of tone smoothed into matte flat patches the way pigment would settle without rebrushing, then the boundaries between those patches re-sharpened so they read as deliberate brush meets rather than soft photo gradients. Colours pushed slightly more saturated than the source, the way an artist working from a reference always overstates colour to compensate for the loss of luminance range. Edges crisp, regions flat, surface clearly painterly.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/acrylic-painting.png)

```tsx
import { Bilateral, Saturate, Sharpen } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const LANDSCAPE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg";

const W = 1024;
const H = 1536;

export default function AcrylicPainting() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Sharpen amount={0.9}>
				<Saturate amount={1.3} mode="parameter">
					<Bilateral spatialSigma={9} colorSigma={38}>
						<Image src={LANDSCAPE_URL} width={W} height={H} fit="cover" />
					</Bilateral>
				</Saturate>
			</Sharpen>
		</Canvas>
	);
}
```
