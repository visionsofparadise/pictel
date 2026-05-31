# Hard Mix Pop

A portrait collapsed into a binary 8-colour scream — every pixel's channels independently snap to either full-on or full-off depending on whether the sum with a linear vertical gradient crosses the midpoint. The result is one of eight saturated primaries everywhere, with no in-between values. The portrait's silhouette and tonal regions are preserved but the colour space is plainly the eight RGB corners. Hard-edged, screenprint-style, and impossible to mistake for a continuous-tone photograph.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/portrait-with-background-1.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/hard-mix-pop.png)

```tsx
import { HardMix, LinearGradient } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/portrait-with-background-1.jpg";

const W = 1024;
const H = 1536;

export default function HardMixPop() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<HardMix
				apply={
					<LinearGradient
						width={W}
						height={H}
						angle={90}
						stops={[
							{ color: "rgb(240, 80, 60)", position: 0 },
							{ color: "rgb(80, 60, 220)", position: 1 },
						]}
					/>
				}
			>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
			</HardMix>
		</Canvas>
	);
}
```
