# Stippled Portrait

A studio portrait rendered as a Wall Street Journal hedcut — the technique where the face is built from thousands of tiny ink dots whose density varies with tone, no continuous shading, no linework at all. Dark regions pack the dots tightly so the eye reads them as solid black; midtones space the dots so the white paper shows through in even proportion; highlights drop the dot count to a sparse scatter so the page mostly reads as the paper itself. The face emerges from the negative space between the marks. The look has been the visual signature of the Journal's front-page sketches for nearly forty years.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/stippled-portrait.png)

```tsx
import { Contrast, Grayscale, Halftone } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const HEADSHOT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function StippledPortrait() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Halftone dotSize={5} angle={0} colorMode="luminance" dotColor={[12, 12, 12]}>
				<Contrast amount={1.25} mode="parameter">
					<Grayscale>
						<Image src={HEADSHOT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
					</Grayscale>
				</Contrast>
			</Halftone>
		</Canvas>
	);
}
```
