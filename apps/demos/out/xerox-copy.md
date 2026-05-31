# Xerox Copy

A portrait that has been photocopied — and then photocopied again, several generations down. Midtones have collapsed into either black or white with nothing in between, so the face reads as a punk-zine threshold print. Toner specks and paper-fibre noise pepper the white field where the copier drum picked up dirt. No grey is left, only the high-contrast caricature you'd glue onto a flyer.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/xerox-copy.png)

```tsx
import { Contrast, Grain, Grayscale, Threshold } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function XeroxCopy() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Grain intensity={28} seed={2811}>
				<Threshold threshold={130}>
					<Contrast amount={1.6} mode="parameter">
						<Grayscale>
							<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
						</Grayscale>
					</Contrast>
				</Threshold>
			</Grain>
		</Canvas>
	);
}
```
