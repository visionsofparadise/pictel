# Holographic Foil

A hologram-effect portrait — the subject lifted clean out of their original background and reissued as a trading-card holographic, with iridescent foil tinting only inside the silhouette. The metallic-rainbow shimmer of a foil-stamped sticker pressed onto the face and shoulders: the foil's tonal map drives the brightness while the subject keeps their own contours, the sharp cut of the silhouette holding the shimmer where it belongs. A second source, a scan of physical holographic foil, supplies the spectral wash that fills the cutout.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/holographic-foil.png)

```tsx
import { Contrast, Grayscale, HardLight, Mask } from "@pictel/effects";
import { RemoveBackground } from "@pictel/ml";
import { Canvas, Image } from "pictel";

const HEADSHOT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";
const FOIL_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/foil-texture.jpg";

const canvasW = 1024;
const canvasH = 1024;

export default function HolographicFoil() {
	const subject = (
		<RemoveBackground>
			<Image src={HEADSHOT_URL} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />
		</RemoveBackground>
	);

	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<Mask map={subject}>
				<HardLight
					apply={
						<Grayscale>
							<Contrast amount={1.4}>{subject}</Contrast>
						</Grayscale>
					}
				>
					<Image src={FOIL_URL} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />
				</HardLight>
			</Mask>
		</Canvas>
	);
}
```
