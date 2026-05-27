# Luminance Band Poster

A portrait quantized in brightness only — luminance collapses into five flat tiers while every original hue and saturation passes through untouched. Skin reads as the same skin tone, just at one of five fixed brightness levels rather than along a continuous tonal scale. Saturation is lifted slightly so each band carries its own clear colour identity. The result feels closer to a tonal block-print than a posterize: colour preserved, light reduced.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/luminance-band-poster.png)

```tsx
import { LuminanceBands, Saturate } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg";

const W = 1024;
const H = 1536;

export default function LuminanceBandPoster() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Saturate amount={1.4} mode="parameter">
				<LuminanceBands bands={5}>
					<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
				</LuminanceBands>
			</Saturate>
		</Canvas>
	);
}
```
