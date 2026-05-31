# Color Burn Shadows

A landscape with its lower portion driven into rich burnt-shadow territory — the upper half of the frame is left untouched, then a warm rust-brown shift sweeps in across the middle, then the bottom edge is crushed almost black with a deep red-brown undertone. Where the dodge-style burn falls on the photo, the local saturation intensifies and the dark detail thickens, the way a darkroom burn-in deepens an underexposed lower foreground.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/color-burn-shadows.png)

```tsx
import { ColorBurn, LinearGradient } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const LANDSCAPE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg";

const W = 1024;
const H = 1536;

export default function ColorBurnShadows() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<ColorBurn
				apply={
					<LinearGradient
						width={W}
						height={H}
						angle={180}
						stops={[
							{ color: "rgb(255, 255, 255)", position: 0 },
							{ color: "rgb(255, 255, 255)", position: 0.45 },
							{ color: "rgb(180, 130, 90)", position: 0.75 },
							{ color: "rgb(60, 30, 20)", position: 1 },
						]}
					/>
				}
			>
				<Image src={LANDSCAPE_URL} width={W} height={H} fit="cover" />
			</ColorBurn>
		</Canvas>
	);
}
```
