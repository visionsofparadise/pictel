# Kaleidoscope Fold

A cityscape folded four ways across both horizontal and vertical centre lines — the upper-left quadrant carries the original frame, the upper-right is its horizontal mirror, the lower-left is its vertical mirror, the lower-right is mirrored on both axes. Where the four quadrants meet, the originally-seamless image-edges register against their reflections, producing a closed four-fold symmetric composition that reads like a Rorschach or a kaleidoscope viewfinder at rest.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/kaleidoscope-fold.png)

```tsx
import { Canvas, Image } from "pictel";

const CITY_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg";

const W = 1280;
const H = 1280;
const HALF_W = W / 2;
const HALF_H = H / 2;

export default function KaleidoscopeFold() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<div style={{ display: "grid", gridTemplateColumns: `${HALF_W}px ${HALF_W}px`, gridTemplateRows: `${HALF_H}px ${HALF_H}px`, width: W, height: H }}>
				<Image src={CITY_URL} width={HALF_W} height={HALF_H} fit="cover" />
				<div style={{ transform: "scaleX(-1)", width: HALF_W, height: HALF_H }}>
					<Image src={CITY_URL} width={HALF_W} height={HALF_H} fit="cover" />
				</div>
				<div style={{ transform: "scaleY(-1)", width: HALF_W, height: HALF_H }}>
					<Image src={CITY_URL} width={HALF_W} height={HALF_H} fit="cover" />
				</div>
				<div style={{ transform: "scale(-1, -1)", width: HALF_W, height: HALF_H }}>
					<Image src={CITY_URL} width={HALF_W} height={HALF_H} fit="cover" />
				</div>
			</div>
		</Canvas>
	);
}
```
