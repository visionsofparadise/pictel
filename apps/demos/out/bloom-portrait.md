# Bloom Portrait

A golden-hour portrait pushed into the cinematic bloom register — the brightest patches of the frame (sky behind the subject, the rim of light catching the hair, the highlight on the skin) bleed soft halos into their neighbouring regions, the way an over-exposed optical print would. The original photograph still reads clearly underneath; the bloom is additive light, not a wash. The look sits between an in-camera lens-flare and a graded DI: hot highlights surrounded by halos, the rest of the frame untouched in shadow and midtone.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/bloom-portrait.png)

```tsx
import { Bloom } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg";

const W = 1024;
const H = 1536;

export default function BloomPortrait() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Bloom threshold={0.6} radius={40} intensity={1.4}>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</Bloom>
		</Canvas>
	);
}
```
