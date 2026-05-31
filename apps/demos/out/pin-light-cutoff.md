# Pin Light Cutoff

A portrait re-thresholded through a radial colour field — where the gradient is darker than the photo it replaces the photo's lights, where the gradient is lighter than the photo it replaces the photo's darks. The result is a hard two-source compositing effect: warm radial highlight near the centre where the gradient matches skin tones, snapping into cool deep-blue at the corners where the gradient overrides the photograph entirely. Hard transitions, no smooth blending — the pin-light cutoff in action.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/pin-light-cutoff.png)

```tsx
import { PinLight, RadialGradient } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg";

const W = 1024;
const H = 1536;

export default function PinLightCutoff() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<PinLight
				apply={
					<RadialGradient
						width={W}
						height={H}
						centerX={0.5}
						centerY={0.4}
						radius={0.9}
						stops={[
							{ color: "rgb(255, 220, 180)", position: 0 },
							{ color: "rgb(170, 100, 80)", position: 0.55 },
							{ color: "rgb(20, 30, 60)", position: 1 },
						]}
					/>
				}
			>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
			</PinLight>
		</Canvas>
	);
}
```
