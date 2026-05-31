# Fisheye Lens

A wide aerial cityscape pushed through a centred bulge, as if shot through a fisheye lens dome. The middle of the frame magnifies outward — the city blocks at the centre puff toward the viewer, straight avenues and rooftop ridges bowing into smooth arcs that follow the curvature of the bulge. The perimeter stays anchored: the same blocks that sit at the edge of the original photo still sit at the edge of the warped one, so the deformation reads as an optical bulge rather than a uniform zoom. The transition from edge to centre is smooth — no swirl, no tear, no flat plateau in the middle.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/fisheye-lens.png)

```tsx
import { DisplacementMap, VectorField } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const CITY_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg";

const W = 1600;
const H = 1066;

export default function FisheyeLens() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<DisplacementMap
				useMagnitude
				scaleX={-120}
				scaleY={-120}
				map={<VectorField pattern="radial" magnitude="bump" width={W} height={H} />}
			>
				<Image src={CITY_URL} width={W} height={H} fit="cover" />
			</DisplacementMap>
		</Canvas>
	);
}
```
