# Double Exposure

The wedding-album darkroom trick — two negatives printed on the same sheet so the brighter parts of each frame survive while the darker parts give way. A portrait sits behind a cityscape; where the portrait's beard and clothing fall into shadow, the city's rooftops, streets, and bright sky push through. The composite reads as one image but carries both subjects, dovetailed by luminance.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/double-exposure.png)

```tsx
import { Lighten } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const HEADSHOT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";
const CITY_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg";

const W = 1024;
const H = 1024;

export default function DoubleExposure() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Lighten
				apply={<Image src={CITY_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />}
			>
				<Image src={HEADSHOT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</Lighten>
		</Canvas>
	);
}
```
