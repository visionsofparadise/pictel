# Lighter Color Overlay

A portrait peppered with bright dust speckles — a thresholded noise field is laid over the photo via lighter-color, so wherever the noise is white it replaces the underlying pixel entirely (since white wins the lightness comparison everywhere), and wherever the noise is black the portrait passes through unchanged. The effect is a hard-edged white-fleck overlay, not a translucent dust pass — every dot is a clean cutout rather than a soft alpha bleed.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/portrait-with-background-1.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/lighter-color-overlay.png)

```tsx
import { LighterColor, ProceduralNoise, Threshold } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/portrait-with-background-1.jpg";

const W = 1024;
const H = 1536;

export default function LighterColorOverlay() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<LighterColor
				apply={
					<Threshold threshold={220}>
						<ProceduralNoise
							width={W}
							height={H}
							type="simplex"
							seed={1832}
							scale={4.5}
							octaves={2}
						/>
					</Threshold>
				}
			>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
			</LighterColor>
		</Canvas>
	);
}
```
