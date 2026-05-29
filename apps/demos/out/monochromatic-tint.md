# Monochromatic Tint

A golden-hour portrait reduced to a single tonal palette — deep midnight blue in the shadows resolving to a warm ivory in the highlights. Colour information is discarded entirely; what remains is luminance mapped onto a two-colour gradient. The result reads like an editorial cover treatment, the kind that unifies a portrait with surrounding typography rather than competing with it.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/monochromatic-tint.png)

```tsx
import { Duotone } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg";

const W = 1024;
const H = 1536;

const SHADOW: [number, number, number] = [22, 38, 64];
const HIGHLIGHT: [number, number, number] = [248, 232, 198];

export default function MonochromaticTint() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Duotone dark={SHADOW} light={HIGHLIGHT}>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</Duotone>
		</Canvas>
	);
}
```
