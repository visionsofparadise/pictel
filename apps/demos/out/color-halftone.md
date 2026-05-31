# CMYK Color Halftone

A portrait reproduced as a four-color process print — cyan, magenta, yellow, and black dot screens each laid down on their own rotated grid and overprinted, the way colour emerges in newspaper and pulp-comic printing. Up close the image dissolves into a field of overlapping coloured dots; at a viewing distance the eye fuses them back into continuous tone. The dot lattice is coarse enough to read as ink-on-newsprint rather than a fine fashion-magazine screen.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/color-halftone.png)

```tsx
import { Halftone } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg";

const W = 1024;
const H = 1536;

export default function ColorHalftone() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Halftone dotSize={12} colorMode="cmyk">
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
			</Halftone>
		</Canvas>
	);
}
```
