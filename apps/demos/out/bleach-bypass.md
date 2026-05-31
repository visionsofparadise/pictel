# Bleach Bypass

A landscape pushed into the desaturated, high-contrast silver-retention look that motion-picture labs got in the 80s and 90s by skipping (or partially skipping) the bleach bath during ECN-2 processing — the residual undeveloped silver layered on top of the colour dyes, hardening the contrast and draining most of the chroma. Colour is present but muted, the saturated greens and warm earth-tones flattened back toward a near-monochrome base. Shadows close down hard, highlights bloom but don't blow out, and a fine silver-grain noise sits across the whole frame the way a retained silver halide pattern would. Cinematic in the literal sense — the look of Saving Private Ryan, Seven, and a generation of 35mm features that wanted the photochemistry to show.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/bleach-bypass.png)

```tsx
import { ColorGrade, Grain } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const LANDSCAPE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg";

const W = 1024;
const H = 1536;

export default function BleachBypass() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Grain intensity={14} seed={4137}>
				<ColorGrade brightness={1.08} contrast={1.45} saturation={0.35} temperature={-0.05} tint={0}>
					<Image src={LANDSCAPE_URL} width={W} height={H} fit="cover" />
				</ColorGrade>
			</Grain>
		</Canvas>
	);
}
```
