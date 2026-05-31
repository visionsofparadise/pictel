# Skin Smooth

A portrait given the editorial retouching treatment — pores, fine wrinkles, and skin texture flattened into a smooth even tone, while the strong edges that define the face (the line where hair meets skin, where shirt meets neck, where eyelid meets eye) stay crisp. The smoothing is selectively applied to flat regions where small variation is noise rather than structure, leaving the contour drawing of the face untouched. The result is the classic magazine-cover smooth-skin retouch, achieved by edge-preserving smoothing rather than a uniform blur.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/skin-smooth.png)

```tsx
import { Bilateral } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function SkinSmooth() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Bilateral spatialSigma={8} colorSigma={42}>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
			</Bilateral>
		</Canvas>
	);
}
```
