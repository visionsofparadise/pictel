# Night Vision

A landscape rendered as if seen through a Gen-2 night-vision goggle — every tone mapped onto the green phosphor scale, deep shadows reading as near-black moss-green and highlights as bright electric phosphor-green. Hard contrast pushes the image into a high-key/low-key duality. Fine horizontal scanlines run across the frame, and a coarse intensifier-tube noise speckles the whole field. The scene is plainly readable but unmistakably mediated through a single-channel optical amplifier.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/night-vision.png)

```tsx
import { Contrast, Duotone, Grain, LinePattern, Multiply } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const LANDSCAPE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg";

const W = 1024;
const H = 1536;

const DARK_GREEN: [number, number, number] = [4, 18, 8];
const PHOSPHOR_GREEN: [number, number, number] = [120, 240, 110];

export default function NightVision() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Grain intensity={24} seed={6173}>
				<Multiply
					apply={
						<LinePattern
							width={W}
							height={H}
							seed={0}
							spacing={3}
							thickness={1}
							angle={0}
							color="rgb(40, 80, 30)"
							background="rgb(230, 240, 220)"
						/>
					}
				>
					<Duotone dark={DARK_GREEN} light={PHOSPHOR_GREEN}>
						<Contrast amount={1.35} mode="parameter">
							<Image src={LANDSCAPE_URL} width={W} height={H} fit="cover" />
						</Contrast>
					</Duotone>
				</Multiply>
			</Grain>
		</Canvas>
	);
}
```
