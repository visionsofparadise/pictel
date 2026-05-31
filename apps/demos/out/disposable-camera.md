# Disposable Camera

A portrait that looks like it came back from the drugstore one-hour-photo counter — the unmistakable disposable-camera aesthetic. A direct camera-flash hot-spot pools warm white light on the subject's face and falls off rapidly into a dimmed border; the colour balance leans warm-yellow with a slight pinkish push; heavy ISO 400 grain sits across the whole frame like coarse film salt. The image reads as deliberately amateur — late-90s/early-2000s party photography, the kind of cardboard-bodied Kodak FunSaver picture that's now an entire visual register of its own.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/portrait-with-background-1.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/disposable-camera.png)

```tsx
import { ColorGrade, Grain, Multiply, RadialGradient } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/portrait-with-background-1.jpg";

const W = 936;
const H = 1404;

export default function DisposableCamera() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Multiply
				apply={
					<RadialGradient
						width={W}
						height={H}
						centerX={0.5}
						centerY={0.45}
						radius={0.55}
						stops={[
							{ color: "rgba(255, 248, 235, 1)", position: 0 },
							{ color: "rgba(255, 235, 210, 1)", position: 0.5 },
							{ color: "rgba(120, 95, 80, 1)", position: 1 },
						]}
					/>
				}
			>
				<Grain intensity={32} seed={2099}>
					<ColorGrade contrast={1.12} saturation={1.08} temperature={0.12} tint={0.04} brightness={1.04}>
						<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
					</ColorGrade>
				</Grain>
			</Multiply>
		</Canvas>
	);
}
```
