# Thermal Vision

A studio portrait re-rendered through the canonical "Ironbow" thermal-camera palette — the colour scheme an infrared imager applies when it maps surface temperature to display tone. The coldest regions (deep shadow, dark hair, background) drop into near-black-purple; intermediate temperatures climb through magenta into burning red; the warmest skin highlights resolve into orange, then gold, then a near-white peak where the brightest pixels read as the hottest point in the frame. The image is no longer a photograph of a person — it's a synthetic visualisation, the kind of false-colour image a search-and-rescue camera or a building-envelope thermography report would produce, with the original luminance preserved as the only structure carrying through the recolour.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/thermal-vision.png)

```tsx
import { GradientMap } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const HEADSHOT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function ThermalVision() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<GradientMap
				stops={[
					{ color: "#000010", position: 0 },
					{ color: "#1a0050", position: 0.18 },
					{ color: "#7a0080", position: 0.38 },
					{ color: "#d12020", position: 0.58 },
					{ color: "#ffaa00", position: 0.78 },
					{ color: "#fff4c4", position: 0.92 },
					{ color: "#ffffff", position: 1 },
				]}
			>
				<Image src={HEADSHOT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</GradientMap>
		</Canvas>
	);
}
```
