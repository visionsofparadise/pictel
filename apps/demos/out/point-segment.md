# Point Segment

A portrait isolated from its environment by a single positional prompt — a point is placed near the subject's head, and the segmentation model expands outward from that anchor to find the contiguous region that belongs to the same object. The resulting mask carves the subject cleanly out of the photograph and drops them against a saturated conic-gradient backdrop. Different from a background-removal model that operates implicitly on "subject vs. background" — here the agent is choosing what counts as the subject by dropping a pin.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/portrait-with-background-2.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/point-segment.png)

```tsx
import { ConicGradient, Mask } from "@pictel/effects";
import { Sam2 } from "@pictel/ml";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/portrait-with-background-2.jpg";

const W = 713;
const H = 1024;

export default function PointSegment() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<div style={{ position: "relative" }}>
				<ConicGradient
					width={W}
					height={H}
					stops={[
						{ color: "rgb(60, 20, 90)", position: 0 },
						{ color: "rgb(180, 50, 110)", position: 0.4 },
						{ color: "rgb(80, 30, 130)", position: 1 },
					]}
				/>
				<div style={{ position: "absolute", inset: 0 }}>
					<Mask
						source="luminance"
						map={
							<Sam2 points={[{ x: Math.round(W / 2), y: Math.round(H * 0.35) }]}>
								<Image src={PORTRAIT_URL} width={W} height={H} fit="contain" />
							</Sam2>
						}
					>
						<Image src={PORTRAIT_URL} width={W} height={H} fit="contain" />
					</Mask>
				</div>
			</div>
		</Canvas>
	);
}
```
