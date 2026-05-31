# Hard Light Drama

A portrait dramatized through a steep diagonal split-tone — the upper-left of the frame is washed in a hot rust-orange light source, the lower-right falls into cold deep-blue, and the midline passes through a true grey that lets the photograph come through cleanly. Where the gradient is bright the image's contrast pushes hard; where the gradient is dark the image is burned into shadow. The look approaches cinematic two-light split-key lighting recreated entirely as a tonal grade.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/portrait-with-background-1.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/hard-light-drama.png)

```tsx
import { HardLight, LinearGradient } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/portrait-with-background-1.jpg";

const W = 1024;
const H = 1536;

export default function HardLightDrama() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<HardLight
				apply={
					<LinearGradient
						width={W}
						height={H}
						angle={20}
						stops={[
							{ color: "rgb(220, 110, 80)", position: 0 },
							{ color: "rgb(128, 128, 128)", position: 0.5 },
							{ color: "rgb(20, 30, 90)", position: 1 },
						]}
					/>
				}
			>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
			</HardLight>
		</Canvas>
	);
}
```
