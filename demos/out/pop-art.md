# Pop Art

A portrait restaged as a '60s comic-pop-art print — Lichtenstein-meets-Warhol, the face flattened into saturated benday-dot fields with heavy black outlines stamped over the top. Skin and hair collapse into a few bold colour blocks; the dots dominate the mid-tones the way newsprint screens did, the contours read like inked woodblock. The mood is loud, graphic, and unmistakably 1960s screen-print.

| Before | After |
| --- | --- |
| ![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg) | ![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/pop-art.png) |

```tsx
import { Contrast, Halftone, Multiply, Outline, Saturate, Threshold } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PHOTO_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg";

export default function PopArt() {
	return (
		<Canvas mode="display" dimensions={{ width: 640, height: 960 }}>
			<Multiply
				apply={
					<Threshold threshold={140}>
						<Outline sigma={2.4} k={1.6} epsilon={0.005} phi={200}>
							<Image src={PHOTO_URL} width={640} height={960} fit="cover" crossOrigin="anonymous" />
						</Outline>
					</Threshold>
				}
			>
				<Halftone colorMode="color" dotSize={10}>
					<Contrast amount={1.35}>
						<Saturate amount={2.4}>
							<Image src={PHOTO_URL} width={640} height={960} fit="cover" crossOrigin="anonymous" />
						</Saturate>
					</Contrast>
				</Halftone>
			</Multiply>
		</Canvas>
	);
}
```
