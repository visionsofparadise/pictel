# Saturation Recolor

A landscape whose saturation level is spatially driven by a radial sweep — angular sectors where the apply layer is highly saturated push the photograph's local colour up to vivid, and sectors where it's near-grey collapse the photo to monochrome. The hue and brightness of the original frame are preserved exactly; only the colour intensity varies across the image's angular position. Half the frame reads as a bold colourful landscape, the other half reads as desaturated grey.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/saturation-recolor.png)

```tsx
import { ConicGradient, Saturation } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const LANDSCAPE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg";

const W = 1024;
const H = 1536;

export default function SaturationRecolor() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Saturation
				apply={
					<ConicGradient
						width={W}
						height={H}
						centerX={0.5}
						centerY={0.5}
						startAngle={0}
						stops={[
							{ color: "rgb(255, 100, 100)", position: 0 },
							{ color: "rgb(100, 100, 100)", position: 0.5 },
							{ color: "rgb(255, 100, 100)", position: 1 },
						]}
					/>
				}
			>
				<Image src={LANDSCAPE_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</Saturation>
		</Canvas>
	);
}
```
