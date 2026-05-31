# X-Ray Black & White

A portrait flipped to a medical radiograph register — colour discarded, tones inverted so what was light becomes dark and what was dark becomes light, and the result pushed to high contrast so the face reads as a flat-tone diagram rather than a photograph. Hair and shadow now appear as bright phosphor signal; skin and highlights drop into a deep near-black. The look approaches the visual register of an X-ray film viewed against a light box, although the technique is a tonal inversion rather than literal radiation imaging.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/xray-bw.png)

```tsx
import { Contrast, Grayscale, Invert } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function XrayBw() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Contrast amount={1.45} mode="parameter">
				<Invert>
					<Grayscale>
						<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
					</Grayscale>
				</Invert>
			</Contrast>
		</Canvas>
	);
}
```
