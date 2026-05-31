# Color Dodge Glow

A cityscape with a strong off-centre warm sunburst — bright cream-and-amber light blown out around a position in the upper-left quadrant, with the brightness falling off radially into the rest of the photograph, which is left at its original tone. Where the bright dodge is intense, the underlying tones lift toward white; outside its falloff the original frame is untouched. The look is the dodged-print sun-burst aesthetic used to suggest a low afternoon sun pouring into the frame.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/color-dodge-glow.png)

```tsx
import { ColorDodge, RadialGradient } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const CITY_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg";

const W = 1536;
const H = 1024;

export default function ColorDodgeGlow() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<ColorDodge
				apply={
					<RadialGradient
						width={W}
						height={H}
						centerX={0.35}
						centerY={0.4}
						radius={0.45}
						stops={[
							{ color: "rgb(255, 235, 200)", position: 0 },
							{ color: "rgb(220, 180, 110)", position: 0.35 },
							{ color: "rgb(40, 30, 20)", position: 0.85 },
							{ color: "rgb(0, 0, 0)", position: 1 },
						]}
					/>
				}
			>
				<Image src={CITY_URL} width={W} height={H} fit="cover" />
			</ColorDodge>
		</Canvas>
	);
}
```
