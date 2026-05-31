# Color Blend Recolor

A portrait given a complete colour transplant — the photograph's luminance is held intact (so every shadow, every highlight, every tonal transition reads the way it did in the original), and a vertical blue-to-pink gradient is plumbed in for the hue and saturation at every pixel. The face has the same form and the same lighting; only the underlying colour identity has been swapped wholesale. Top reads cool blue, bottom warm pink, with skin tones, hair, and background all carried through the substitution.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/color-blend-recolor.png)

```tsx
import { Color, LinearGradient } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function ColorBlendRecolor() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Color
				apply={
					<LinearGradient
						width={W}
						height={H}
						angle={90}
						stops={[
							{ color: "rgb(80, 130, 220)", position: 0 },
							{ color: "rgb(220, 90, 140)", position: 1 },
						]}
					/>
				}
			>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
			</Color>
		</Canvas>
	);
}
```
