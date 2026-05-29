# Dappled Shadow

A portrait lit through the canopy of a leafy tree on a sunny afternoon — large organic patches of bright sunlight and cooler diffuse shadow falling across the subject in a soft, mottled pattern. The shadow shapes are not crisp; they are the blurred large-scale silhouettes of overlapping leaves seen far above the camera, where the aperture of the gaps between branches softens every edge. The image stays recognisably a portrait, but the lighting has gained the lived-in irregularity of a moment shot in a garden rather than a studio — the kind of casual sun-flecked dappling that classical French Impressionists worked obsessively to render in paint.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/portrait-with-background-1.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/dappled-shadow.png)

```tsx
import { Multiply, ProceduralNoise } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/portrait-with-background-1.jpg";

const W = 936;
const H = 1404;

export default function DappledShadow() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Multiply
				apply={
					<ProceduralNoise
						width={W}
						height={H}
						type="simplex"
						seed={8101}
						scale={0.006}
						octaves={3}
						tint={[245, 230, 200]}
					/>
				}
			>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</Multiply>
		</Canvas>
	);
}
```
