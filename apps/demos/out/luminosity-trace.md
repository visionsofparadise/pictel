# Luminosity Trace

A portrait silhouette transferred onto rough textured paper — the paper substrate provides every pixel's hue and saturation (so the warm cream pulp tone reads through everywhere), and the portrait's brightness map is overlaid as the luminance contour, lifting the texture into the shape of a face. The result is the photograph rendered as if exposed onto the paper through a tonal stencil, with the paper's own colour and grain carried through everywhere.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/luminosity-trace.png)

```tsx
import { Luminosity } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";
const TEXTURE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/pencil-texture.jpg";

const W = 1024;
const H = 1024;

export default function LuminosityTrace() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Luminosity
				apply={
					<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
				}
			>
				<Image src={TEXTURE_URL} width={W} height={H} fit="cover" />
			</Luminosity>
		</Canvas>
	);
}
```
