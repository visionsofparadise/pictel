# Linear Burn Deep

A cityscape with the corners pulled into deep cocoa-brown shadow — a centre-bright, edge-dark radial gradient is linear-burned into the photograph, so the bright centre passes through unchanged while the edges sum below black and crush hard. The image gains a heavy, weighted vignette that's tonally rich rather than colour-neutral, suiting the late-evening cityscape and giving the eye a clear central focal point. More aggressive than a Multiply vignette: linear-burn cuts deeper into the dark tones.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/linear-burn-deep.png)

```tsx
import { LinearBurn, RadialGradient } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const CITY_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg";

const W = 1536;
const H = 1024;

export default function LinearBurnDeep() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<LinearBurn
				apply={
					<RadialGradient
						width={W}
						height={H}
						centerX={0.5}
						centerY={0.5}
						radius={1.0}
						stops={[
							{ color: "rgb(245, 230, 220)", position: 0 },
							{ color: "rgb(180, 160, 150)", position: 0.55 },
							{ color: "rgb(70, 50, 40)", position: 1 },
						]}
					/>
				}
			>
				<Image src={CITY_URL} width={W} height={H} fit="cover" />
			</LinearBurn>
		</Canvas>
	);
}
```
