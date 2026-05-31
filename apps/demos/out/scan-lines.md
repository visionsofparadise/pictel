# CRT Scan Lines

A cityscape photographed off the screen of an old cathode-ray-tube monitor — fine horizontal black scanlines run across the entire image at the line-pitch of a 70s broadcast tube, every other row dimmed where the gun didn't paint. The image underneath is intact and readable; the scanlines lay over it as a multiplicative dimming pattern. A slight cooling and saturation lift give the whole frame the punchy oversaturated look of CRT phosphors.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/scan-lines.png)

```tsx
import { ColorGrade, LinePattern, Multiply } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const CITY_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg";

const W = 1536;
const H = 1024;

export default function ScanLines() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Multiply
				apply={
					<LinePattern
						width={W}
						height={H}
						seed={0}
						spacing={4}
						thickness={2}
						angle={0}
						color="rgb(30, 30, 40)"
						background="rgb(220, 220, 230)"
					/>
				}
			>
				<ColorGrade brightness={0.95} contrast={1.1} saturation={1.5} temperature={-0.3} tint={-0.2}>
					<Image src={CITY_URL} width={W} height={H} fit="cover" />
				</ColorGrade>
			</Multiply>
		</Canvas>
	);
}
```
