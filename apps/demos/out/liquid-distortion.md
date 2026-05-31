# Liquid Distortion

A portrait photographed as if reflected on the surface of a slow-moving pond — large lazy vertical waves drag the image up and down across broad bands, with smaller horizontal sway nudging the columns sideways. The subject still reads as a face, but the geometry has been pulled into long flowing ripples — verticals bend, horizontals smear vertically, the whole frame breathes the way a still water-reflection moves with a passing breeze. The displacement is anisotropic on purpose: vertical motion dominates so the impression is of a tall, gentle swell rather than a uniformly choppy surface.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/liquid-distortion.png)

```tsx
import { DisplacementMap, ProceduralNoise } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg";

const W = 1024;
const H = 1536;

export default function LiquidDistortion() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<DisplacementMap
				scaleX={28}
				scaleY={70}
				map={<ProceduralNoise width={W} height={H} type="simplex" seed={1729} scale={0.008} octaves={2} />}
			>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
			</DisplacementMap>
		</Canvas>
	);
}
```
