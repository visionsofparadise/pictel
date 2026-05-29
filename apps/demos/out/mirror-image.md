# Mirror Image

A wide cityscape split down the middle and reflected across the seam — the left half is the original frame, the right half is the same frame flipped horizontally. Architectural lines that hit the centre line continue into their mirror image, producing a symmetrical composition that reads like a kaleidoscope fold. Skylines and ridgelines that were merely interesting become formally rhythmic.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/mirror-image.png)

```tsx
import { Canvas, Image } from "pictel";

const CITY_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg";

const W = 1536;
const H = 1024;
const HALF = W / 2;

export default function MirrorImage() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<div style={{ display: "flex", width: W, height: H }}>
				<Image src={CITY_URL} width={HALF} height={H} fit="cover" crossOrigin="anonymous" />
				<div style={{ transform: "scaleX(-1)", width: HALF, height: H }}>
					<Image src={CITY_URL} width={HALF} height={H} fit="cover" crossOrigin="anonymous" />
				</div>
			</div>
		</Canvas>
	);
}
```
