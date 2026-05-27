# Vivid Light Pop

A portrait pushed through an aggressive split-toned grading — the lit side of the face takes on a hot orange-red cast, the shadow side a cold blue, and the transitions between them snap rather than blend. Highlights blow out toward white where the gradient is light; shadows crush toward black where it is dark. The contrast is exaggerated beyond what a normal grade would produce, into the punchy poster-art register.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/vivid-light-pop.png)

```tsx
import { LinearGradient, VividLight } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg";

const W = 1024;
const H = 1536;

export default function VividLightPop() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<VividLight
				apply={
					<LinearGradient
						width={W}
						height={H}
						angle={45}
						stops={[
							{ color: "rgb(255, 100, 80)", position: 0 },
							{ color: "rgb(190, 130, 100)", position: 0.5 },
							{ color: "rgb(50, 130, 220)", position: 1 },
						]}
					/>
				}
			>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</VividLight>
		</Canvas>
	);
}
```
