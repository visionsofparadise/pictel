# Paper Overlay

A landscape printed onto rough toothed paper rather than glossy stock — the photograph still carries the original tones, but the dark areas pick up the paper's coarse pencil-stroke texture and the highlights stay clean. The effect is the look of a fine-art giclée print on watercolour paper, or a photo reprinted as a magazine insert page. The surface texture is felt without obscuring the image.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/paper-overlay.png)

```tsx
import { Overlay } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const LANDSCAPE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg";
const PAPER_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/pencil-texture.jpg";

const W = 1024;
const H = 1536;

export default function PaperOverlay() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Overlay
				apply={<Image src={PAPER_URL} width={W} height={H} fit="cover" />}
			>
				<Image src={LANDSCAPE_URL} width={W} height={H} fit="cover" />
			</Overlay>
		</Canvas>
	);
}
```
