# LUT Grade

A golden-hour portrait pushed into the cinematic orange-and-teal of color-graded film stills — skin tones warming toward amber and copper, shadows cooling into rich cyan and deep blue. The grade is carried by an external `orange-and-blue-lut.cube` LUT data file (a Photon 3D ColorGrading cube), applied as a secondary source alongside the photograph. The result is less a filter than a finishing pass: the same face, the same hour, recast as a frame from a feature.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/lut-grade.png)

```tsx
import { CubeLUT } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const GOLDEN_HOUR_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg";
const LUT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/orange-and-blue-lut.cube";

const canvasW = 683;
const canvasH = 1024;

export default function LUTGrade() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<CubeLUT src={LUT_URL}>
				<Image src={GOLDEN_HOUR_URL} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />
			</CubeLUT>
		</Canvas>
	);
}
```
