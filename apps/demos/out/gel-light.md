# Gel Light

A portrait lit as if by a rig of theatrical gel-coloured spotlights sweeping clockwise around the subject — hot pink across one shoulder, dropping into amber and gold across the face, cooling through emerald and electric cyan past the other shoulder, then climbing back through violet to magenta. The colours sit *on* the skin and clothing rather than replacing them, the way a coloured gel modifies an existing photograph rather than recolouring it from scratch — original luminance and contrast preserved, the rainbow sweep blending in as light rather than paint. The mood is high-fashion editorial: a single still under a rotating Source Four with chromatic gels in every aperture.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/gel-light.png)

```tsx
import { ConicGradient, SoftLight } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg";

const W = 1024;
const H = 1536;

export default function GelLight() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<SoftLight
				apply={
					<ConicGradient
						width={W}
						height={H}
						centerX={0.5}
						centerY={0.5}
						stops={[
							{ color: "#ff2a6d", position: 0 },
							{ color: "#ff8a3c", position: 0.18 },
							{ color: "#f7d048", position: 0.34 },
							{ color: "#4cd964", position: 0.52 },
							{ color: "#3aa6ff", position: 0.7 },
							{ color: "#9b4dff", position: 0.86 },
							{ color: "#ff2a6d", position: 1 },
						]}
					/>
				}
			>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
			</SoftLight>
		</Canvas>
	);
}
```
