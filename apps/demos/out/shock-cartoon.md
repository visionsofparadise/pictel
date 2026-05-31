# Shock Cartoon

A portrait flattened into a clean cartoon — soft tonal regions consolidated into broad uniform patches with crisp hard edges along the contours, the way a comic-book artist might block in colours after the linework. No outline strokes are added; the edges emerge naturally where adjacent flat regions meet. Skin tones, hair, and background all simplify into a small number of contiguous fields. The look is the cel-style cartoon flatten without the explicit ink overlay.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/portrait-with-background-1.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/shock-cartoon.png)

```tsx
import { Saturate, ShockFilter } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/portrait-with-background-1.jpg";

const W = 1024;
const H = 1536;

export default function ShockCartoon() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Saturate amount={1.35} mode="parameter">
				<ShockFilter iterations={12} strength={0.9}>
					<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
				</ShockFilter>
			</Saturate>
		</Canvas>
	);
}
```
