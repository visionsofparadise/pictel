# Vintage Polaroid

A portrait presented as an instant Polaroid print, lying on a worn brown surface — the photograph itself faded toward warm sepia, the saturation slightly drained, the contrast pulled back to the soft-shoulder look of dye-diffusion prints from the 1980s. Around the image, the unmistakable wide white cardboard border with the extra-thick lower lip where you'd handwrite a date. Mild grain across the photo carries the look of analog emulsion.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/vintage-polaroid.png)

```tsx
import { ColorGrade, Grain } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg";

const W = 1024;
const H = 1280;

const PHOTO_W = 880;
const PHOTO_H = 880;

export default function VintagePolaroid() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<div
				style={{
					width: W,
					height: H,
					backgroundColor: "rgb(80, 70, 64)",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "flex-start",
					paddingTop: 80,
					boxSizing: "border-box",
				}}
			>
				<div
					style={{
						width: W - 144,
						backgroundColor: "rgb(248, 244, 232)",
						padding: 36,
						paddingBottom: 180,
						boxSizing: "border-box",
					}}
				>
					<Grain intensity={14} seed={4811}>
						<ColorGrade brightness={1.05} contrast={0.88} saturation={0.7} temperature={0.9} tint={0.1}>
							<Image
								src={PORTRAIT_URL}
								width={PHOTO_W - 72}
								height={PHOTO_H - 72}
								fit="cover"
							/>
						</ColorGrade>
					</Grain>
				</div>
			</div>
		</Canvas>
	);
}
```
