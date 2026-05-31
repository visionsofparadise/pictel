# Soft Light Grade

A portrait given a warm-to-cool atmospheric grade — the upper third of the frame washed with a peach-amber light as if catching late-afternoon sun, the lower third sliding into a violet-blue twilight cast, with a soft transition through dusty mauve in the middle. The photograph's underlying tones and detail are preserved; only the colour temperature varies smoothly down the frame, the way a graduated lens filter would split a portrait between two light sources without flattening the face into either.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/soft-light-grade.png)

```tsx
import { LinearGradient, SoftLight } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function SoftLightGrade() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<SoftLight
				apply={
					<LinearGradient
						width={W}
						height={H}
						angle={90}
						stops={[
							{ color: "rgb(255, 200, 130)", position: 0 },
							{ color: "rgb(180, 160, 200)", position: 0.55 },
							{ color: "rgb(60, 80, 140)", position: 1 },
						]}
					/>
				}
			>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
			</SoftLight>
		</Canvas>
	);
}
```
