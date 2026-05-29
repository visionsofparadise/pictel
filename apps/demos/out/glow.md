# Glow

Evening light bleeding into a halo around the brightest patches of the landscape — the sky, the sun's last warmth on water and stone, smeared softly outward the way long-exposure film blooms in its highlights. Magic-hour overdrive without overcooking: the shadows stay dark and detailed, but anything already bright lifts into a luminous wash that softens the edge between subject and air.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/glow.png)

```tsx
import { Bloom } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const LANDSCAPE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg";

const canvasW = 640;
const canvasH = 960;

export default function Glow() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<Bloom threshold={0.15} radius={18} intensity={6}>
				<Image
					src={LANDSCAPE_URL}
					width={canvasW}
					height={canvasH}
					fit="cover"
					crossOrigin="anonymous"
				/>
			</Bloom>
		</Canvas>
	);
}
```
