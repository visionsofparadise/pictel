# Motion Streak

The whole cityscape smeared along one axis, as if the frame were captured mid-pan on a long exposure. Every building edge, every street and rooftop, stretches into a horizontal streak following the direction of travel — a uniform directional blur that turns the dense urban grid into a rush of speed lines. Not a soft isotropic blur: the smear is clearly directional, sharp across the axis of motion and stretched along it.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/motion-streak.png)

```tsx
import { MotionBlur } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const CITY_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg";

const W = 1280;
const H = 853;

export default function MotionStreak() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<MotionBlur angle={8} length={48}>
				<Image src={CITY_URL} width={W} height={H} fit="cover" />
			</MotionBlur>
		</Canvas>
	);
}
```
