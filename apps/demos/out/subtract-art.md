# Subtract Color Art

A cityscape with a colour wheel of pigment subtracted from it — different angular regions of the frame have different complementary colours pulled out, so the same scene reads as four overlapping near-duotones meeting at the centre. Architecture and detail remain in place; only the colour signature varies by sector. The look is a fine-art-print colour study — the same image filtered through four different ink removals, composed as a single radial collage.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/subtract-art.png)

```tsx
import { ColorGrade, ConicGradient, Subtract } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const CITY_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg";

const W = 1536;
const H = 1024;

export default function SubtractArt() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<ColorGrade saturation={1.3} contrast={1.1}>
				<Subtract
					apply={
						<ConicGradient
							width={W}
							height={H}
							centerX={0.5}
							centerY={0.5}
							startAngle={0}
							stops={[
								{ color: "rgb(40, 0, 80)", position: 0 },
								{ color: "rgb(0, 120, 80)", position: 0.33 },
								{ color: "rgb(120, 80, 0)", position: 0.66 },
								{ color: "rgb(40, 0, 80)", position: 1 },
							]}
						/>
					}
				>
					<Image src={CITY_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
				</Subtract>
			</ColorGrade>
		</Canvas>
	);
}
```
