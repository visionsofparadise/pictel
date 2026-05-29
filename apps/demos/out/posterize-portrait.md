# Posterize Portrait

A portrait reduced to a small number of flat tonal bands per channel — smooth tonal transitions collapse into hard contour boundaries, and the face reads as a stack of broad colour planes pushed against each other rather than as continuous skin. Saturation is lifted so each band is unmistakably its own colour. The look is the screenprint poster aesthetic: bold, banded, graphic, and a few steps removed from the photograph it started as.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/portrait-with-background-1.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/posterize-portrait.png)

```tsx
import { Posterize, Saturate } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/portrait-with-background-1.jpg";

const W = 1024;
const H = 1536;

export default function PosterizePortrait() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Saturate amount={1.45} mode="parameter">
				<Posterize levels={5}>
					<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
				</Posterize>
			</Saturate>
		</Canvas>
	);
}
```
