# Rainbow Arc

An evening landscape with a soft rainbow arching across the sky — the band of seven colours emerges low on one horizon, peaks above the centre of the frame, and fades into the air on either side. Where the rainbow crosses the landscape the underlying tones lift slightly, the way real light does; outside the arc the photograph is untouched. The colours are saturated enough to read clearly but never opaque — you can see the sky through them.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/rainbow-overlay.png)

```tsx
import { RadialGradient, Screen } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const LANDSCAPE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg";

const W = 1024;
const H = 1536;

export default function RainbowOverlay() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Screen
				apply={
					<RadialGradient
						width={W}
						height={H}
						centerX={0.5}
						centerY={1.4}
						radius={1.6}
						stops={[
							{ color: "rgba(0, 0, 0, 1)", position: 0 },
							{ color: "rgba(0, 0, 0, 1)", position: 0.62 },
							{ color: "rgba(140, 0, 200, 0.65)", position: 0.66 },
							{ color: "rgba(0, 0, 200, 0.75)", position: 0.7 },
							{ color: "rgba(0, 200, 200, 0.85)", position: 0.74 },
							{ color: "rgba(0, 200, 0, 0.85)", position: 0.78 },
							{ color: "rgba(255, 220, 0, 0.85)", position: 0.82 },
							{ color: "rgba(255, 110, 0, 0.85)", position: 0.86 },
							{ color: "rgba(255, 30, 30, 0.85)", position: 0.9 },
							{ color: "rgba(0, 0, 0, 0)", position: 0.93 },
							{ color: "rgba(0, 0, 0, 0)", position: 1 },
						]}
					/>
				}
			>
				<Image src={LANDSCAPE_URL} width={W} height={H} fit="cover" />
			</Screen>
		</Canvas>
	);
}
```
