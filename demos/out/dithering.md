# Dithering

A single headshot run through four eras of hardware-constrained palettes, side by side as a 2×2 grid. The first panel collapses the portrait to pure black and white, ordered in the polite, even pattern of an early Macintosh screen. The second shades the face in the four sickly greens of a Game Boy LCD. The third uses a sixteen-colour palette and a coarse Bayer matrix, the look of an early-90s VGA capture. The fourth steps up to a thirty-two-colour adaptive palette with error-diffusion dithering — the same trick a GIF encoder reaches for when it has to fake a gradient with too few crayons. Across all four, the dithering preserves tonal gradation that the palette alone could never carry: smooth skin, soft falloff at the jawline, the suggestion of depth from almost nothing.

| Before | After |
| --- | --- |
| ![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg) | ![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/dithering.png) |

```tsx
import { Quantize } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const HEADSHOT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const MAC_BW = [[0, 0, 0], [255, 255, 255]] as const;
const GAMEBOY = [[15, 56, 15], [48, 98, 48], [139, 172, 15], [155, 188, 15]] as const;

const SIZE = 192;

export default function Dithering() {
	return (
		<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, imageRendering: "pixelated" }}>
			<Canvas mode="display" dimensions={{ width: SIZE, height: SIZE }}>
				<Quantize palette={MAC_BW} dither="atkinson">
					<Image src={HEADSHOT_URL} width={SIZE} height={SIZE} fit="cover" crossOrigin="anonymous" />
				</Quantize>
			</Canvas>
			<Canvas mode="display" dimensions={{ width: SIZE, height: SIZE }}>
				<Quantize palette={GAMEBOY} dither="floyd-steinberg">
					<Image src={HEADSHOT_URL} width={SIZE} height={SIZE} fit="cover" crossOrigin="anonymous" />
				</Quantize>
			</Canvas>
			<Canvas mode="display" dimensions={{ width: SIZE, height: SIZE }}>
				<Quantize count={16} dither="bayer-4">
					<Image src={HEADSHOT_URL} width={SIZE} height={SIZE} fit="cover" crossOrigin="anonymous" />
				</Quantize>
			</Canvas>
			<Canvas mode="display" dimensions={{ width: SIZE, height: SIZE }}>
				<Quantize count={32} dither="floyd-steinberg">
					<Image src={HEADSHOT_URL} width={SIZE} height={SIZE} fit="cover" crossOrigin="anonymous" />
				</Quantize>
			</Canvas>
		</div>
	);
}
```
