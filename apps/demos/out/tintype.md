# Tintype

A studio portrait pushed back into the 1850s tintype era — collodion silver pulled into a warm cream highlight tone and a deep dark-walnut shadow, with the heavy emulsion grain of a hand-poured plate sitting across the whole frame. The corners crush into near-black the way a real tintype's edges always darkened against the iron support, the centre held bright but slightly amber from the asphaltum varnish. The result is the look of an itinerant photographer's portable studio image from before the gelatin-silver era — monochromatic, warm, gritty, and dimmed at the perimeter.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/tintype.png)

```tsx
import { Duotone, Grain, Multiply, RadialGradient } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const HEADSHOT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function Tintype() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Multiply
				apply={
					<RadialGradient
						width={W}
						height={H}
						centerX={0.5}
						centerY={0.5}
						radius={0.7}
						stops={[
							{ color: "rgba(255, 250, 240, 1)", position: 0 },
							{ color: "rgba(190, 165, 130, 1)", position: 0.65 },
							{ color: "rgba(20, 14, 10, 1)", position: 1 },
						]}
					/>
				}
			>
				<Grain intensity={22} seed={1859}>
					<Duotone dark={[28, 22, 16]} light={[232, 214, 178]}>
						<Image src={HEADSHOT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
					</Duotone>
				</Grain>
			</Multiply>
		</Canvas>
	);
}
```
