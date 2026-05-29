# Old Photo

A century-old landscape pulled from a shoebox — warm sepia tones, contrast pushed slightly past natural so the highlights bloom and the shadows compact, a steady film grain across the frame, and the corners darkening into chocolate as if the print had been kept in light. The image reads as a memory rather than a document.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/old-photo.png)

```tsx
import { Contrast, Grain, Multiply, RadialGradient, Sepia } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const LANDSCAPE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg";

const W = 1024;
const H = 1536;

export default function OldPhoto() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Multiply
				apply={
					<RadialGradient
						width={W}
						height={H}
						radius={0.85}
						stops={[
							{ color: "rgba(255, 240, 215, 1)", position: 0 },
							{ color: "rgba(255, 240, 215, 1)", position: 0.35 },
							{ color: "rgba(60, 35, 18, 1)", position: 1 },
						]}
					/>
				}
			>
				<Grain intensity={22} seed={4127}>
					<Contrast amount={1.25} mode="parameter">
						<Sepia amount={1}>
							<Image src={LANDSCAPE_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
						</Sepia>
					</Contrast>
				</Grain>
			</Multiply>
		</Canvas>
	);
}
```
