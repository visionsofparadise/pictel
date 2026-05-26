# Line Drawing

A portrait reduced to clean contour lines on white — the architecture of the face traced in single-pass strokes that collect at the jaw, the brow, the corners of the mouth, and dissolve into open paper everywhere else. The look sits between a contour study from a life-drawing class and a fashion illustration: economical linework, no shading, no half-tones, nothing in the frame but the shape of the subject and the page it sits on.

| Before | After |
| --- | --- |
| ![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/portrait-with-background-1.jpg) | ![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/line-drawing.png) |

```tsx
import { Blur, Contrast, Grayscale, ShockFilter } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PHOTO_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/portrait-with-background-1.jpg";

const canvasW = 640;
const canvasH = 960;

export default function LineDrawing() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<Contrast amount={1.4}>
				<ShockFilter iterations={20} strength={1}>
					<Blur radius={8}>
						<Grayscale amount={1}>
							<Image
								src={PHOTO_URL}
								width={canvasW}
								height={canvasH}
								fit="cover"
								crossOrigin="anonymous"
							/>
						</Grayscale>
					</Blur>
				</ShockFilter>
			</Contrast>
		</Canvas>
	);
}
```
