# Fade to Color

A portrait composed for editorial layout — the subject anchored against the right edge of the frame, the left side dissolving smoothly into a warm cream field. The transition is soft and atmospheric: skin and hair on the right resolve into full presence; halfway across the image, the photograph gives way to flat colour that holds open space for a title, a quotation, or product copy. The cream tone is borrowed from the warmest highlights of the portrait so the negative space feels of-a-piece with the image rather than pasted over it.

| Before | After |
| --- | --- |
| ![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg) | ![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/fade-to-color.png) |

```tsx
import { LinearGradient } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg";

const canvasW = 1024;
const canvasH = 1536;

export default function FadeToColor() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<div style={{ position: "relative", width: `${String(canvasW)}px`, height: `${String(canvasH)}px`, backgroundColor: "#f4ece1" }}>
				<Image src={PORTRAIT_URL} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />
				<div style={{ position: "absolute", inset: 0 }}>
					<LinearGradient
						width={canvasW}
						height={canvasH}
						angle={0}
						stops={[
							{ color: "rgba(244, 236, 225, 1)", position: 0 },
							{ color: "rgba(244, 236, 225, 1)", position: 0.32 },
							{ color: "rgba(244, 236, 225, 0)", position: 0.62 },
						]}
					/>
				</div>
			</div>
		</Canvas>
	);
}
```
