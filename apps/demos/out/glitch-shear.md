# Glitch Shear

A studio portrait sliced into horizontal bands and shoved sideways by a slow noise field — the face mostly readable but slipped along its scan lines, the way a tape head loses sync and the picture starts walking. Vertical features stay structurally aligned; horizontal edges break in and out of register as the displacement rolls down the frame. No colour shift, no RGB-channel split — purely a one-axis shear driven by a smooth low-frequency noise, the kind of breakdown a CRT display would produce as the timing drifts.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/glitch-shear.png)

```tsx
import { DisplacementMap, ProceduralNoise } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function GlitchShear() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<DisplacementMap
				scaleX={45}
				scaleY={0}
				map={<ProceduralNoise width={W} height={H} type="simplex" seed={3271} scale={3} octaves={2} />}
			>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
			</DisplacementMap>
		</Canvas>
	);
}
```
