# Glowing Edges

An aerial cityscape reduced to its structural skeleton — every building outline, road edge, and rooftop seam lit up as a glowing line against deep near-black. The interior of every flat surface (uniform rooftops, tarmac, the calm body of a building wall) collapses to darkness; only the gradient between regions survives, then is recoloured as if the line work had been etched out and back-lit with cold green-cyan emission. The image reads as an architectural wireframe lit from behind — a city seen as edges first, with every contour glowing harder where the original tonal step was sharper.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/glowing-edges.png)

```tsx
import { EdgeDetect, GradientMap } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const CITY_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg";

const W = 1536;
const H = 1024;

export default function GlowingEdges() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<GradientMap
				stops={[
					{ color: "#020308", position: 0 },
					{ color: "#062028", position: 0.15 },
					{ color: "#12805a", position: 0.45 },
					{ color: "#5cff8c", position: 0.78 },
					{ color: "#e8ffd0", position: 1 },
				]}
			>
				<EdgeDetect kernel="scharr">
					<Image src={CITY_URL} width={W} height={H} fit="cover" />
				</EdgeDetect>
			</GradientMap>
		</Canvas>
	);
}
```
