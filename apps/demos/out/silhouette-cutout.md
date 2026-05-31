# Silhouette Cutout

A portrait reduced to a single solid silhouette against a flat mustard-yellow field — the subject's outline carries every recognisable feature (hair, shoulders, the curve of the jaw), but the interior collapses entirely to ink-black with no surface detail at all. The figure reads the way a 19th-century papercut portrait or a modern poster silhouette would: a hard contrast between subject and ground, the shape doing all the work that tone normally would. The background pushes a saturated retro-poster yellow that throws the silhouette forward.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/portrait-with-background-2.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/silhouette-cutout.png)

```tsx
import { GradientMap } from "@pictel/effects";
import { RemoveBackground } from "@pictel/ml";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/portrait-with-background-2.jpg";

const W = 713;
const H = 1024;

export default function SilhouetteCutout() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<div style={{ position: "relative", width: "100%", height: "100%" }}>
				<div style={{ position: "absolute", inset: 0, background: "#f3c244" }} />
				<div style={{ position: "absolute", inset: 0 }}>
					<GradientMap
						stops={[
							{ color: "#0a0a12", position: 0 },
							{ color: "#0a0a12", position: 1 },
						]}
					>
						<RemoveBackground>
							<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
						</RemoveBackground>
					</GradientMap>
				</div>
			</div>
		</Canvas>
	);
}
```
