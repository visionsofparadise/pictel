# Sharpen Clarity

A cityscape pushed through a clarity pass — small-scale detail crisped up, every edge between adjacent buildings or window panels reading harder, contrast lifted slightly in the midtones, saturation given a small nudge so the bricks, roof tiles, and signage all read with that extra-defined "did the photographer use clarity" look. The image stays recognizable as a normal photograph, not a stylization — just punched-up.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/sharpen-clarity.png)

```tsx
import { ColorGrade, Sharpen } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const CITY_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg";

const W = 1536;
const H = 1024;

export default function SharpenClarity() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<ColorGrade contrast={1.12} saturation={1.2}>
				<Sharpen amount={1.6}>
					<Image src={CITY_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
				</Sharpen>
			</ColorGrade>
		</Canvas>
	);
}
```
