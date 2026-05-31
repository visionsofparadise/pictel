# Flow Streaked

A portrait smeared along the structural lines of its own form — every patch of pixels is dragged along the local direction the face's contours are running. Hair-flow follows hair, the curve of the jaw runs into the curve of the jaw, the gradient of cheek-shadow streaks across it sideways. The image stops reading as a photograph and starts reading as paint pulled by a wide brush following the underlying anatomy, like a long-exposure trace of the face's own geometry.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/flow-streaked.png)

```tsx
import { FlowBlur } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg";

const W = 1024;
const H = 1536;

export default function FlowStreaked() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<FlowBlur length={48}>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
			</FlowBlur>
		</Canvas>
	);
}
```
