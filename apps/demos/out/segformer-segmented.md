# Automatic Segmentation

A cityscape passed through a semantic segmentation model and rendered as the segment map directly — every detected class (building, road, sky, vegetation) is painted in its own deterministic colour, so the result reads like an architecture diagram or a Mapbox vector layout rather than a photograph. No prompt was given; the model decided which regions belong together and which class label each one carries.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/segformer-segmented.png)

```tsx
import { SegFormer } from "@pictel/ml";
import { Canvas, Image } from "pictel";

const CITY_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg";

const W = 1024;
const H = 683;

export default function SegformerSegmented() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<SegFormer>
				<Image src={CITY_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</SegFormer>
		</Canvas>
	);
}
```
