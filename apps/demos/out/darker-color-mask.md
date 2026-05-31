# Darker Color Mask

A landscape sliced through a luminance comparator — every pixel of the photo is compared against the corresponding pixel of a radial gradient and whichever is dimmer in overall luminance wins. The bright centre of the gradient lets the photograph come through almost untouched; out toward the corners the gradient gets dark enough that it wins everywhere, painting in a deep aubergine wash. The transition is a hard-edged region boundary rather than a smooth blend — the look of two stacked images cut against each other on tone.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/darker-color-mask.png)

```tsx
import { DarkerColor, RadialGradient } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const LANDSCAPE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg";

const W = 1024;
const H = 1536;

export default function DarkerColorMask() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<DarkerColor
				apply={
					<RadialGradient
						width={W}
						height={H}
						centerX={0.5}
						centerY={0.4}
						radius={0.9}
						stops={[
							{ color: "rgb(255, 255, 255)", position: 0 },
							{ color: "rgb(140, 80, 60)", position: 0.5 },
							{ color: "rgb(20, 12, 40)", position: 1 },
						]}
					/>
				}
			>
				<Image src={LANDSCAPE_URL} width={W} height={H} fit="cover" />
			</DarkerColor>
		</Canvas>
	);
}
```
