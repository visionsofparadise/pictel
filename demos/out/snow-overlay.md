# Snow Overlay

An evening landscape with a fine scatter of white flecks across the frame — a soft, dry, photographed-during-snowfall feel. The flecks vary in spacing rather than being on a regular grid, and they show only against the darker tones in the scene; bright sky regions absorb them into themselves. The image underneath is fully readable; the snow is an additive layer, not a replacement.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/snow-overlay.png)

```tsx
import { ProceduralNoise, Screen, Threshold } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const LANDSCAPE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg";

const W = 1024;
const H = 1536;

export default function SnowOverlay() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Screen
				apply={
					<Threshold threshold={222}>
						<ProceduralNoise
							width={W}
							height={H}
							type="simplex"
							seed={9214}
							scale={3.2}
							octaves={1}
						/>
					</Threshold>
				}
			>
				<Image src={LANDSCAPE_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</Screen>
		</Canvas>
	);
}
```
