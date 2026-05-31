# Noise Displaced

A portrait shoved around per-pixel by a procedural noise field — every pixel's source position is offset by a vector read from the noise map's red and green channels, so smooth tonal regions of the face buckle and warp into a swimming, glassy distortion. The deformation is non-uniform and organic, the way an image seen through pouring water or a heat haze would refract. The portrait is still recognizable but optically pulled around.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/noise-displaced.png)

```tsx
import { DisplacementMap, ProceduralNoise } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function NoiseDisplaced() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<DisplacementMap
				scaleX={30}
				scaleY={30}
				map={
					<ProceduralNoise
						width={W}
						height={H}
						type="perlin"
						seed={5841}
						scale={4}
						octaves={3}
					/>
				}
			>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
			</DisplacementMap>
		</Canvas>
	);
}
```
