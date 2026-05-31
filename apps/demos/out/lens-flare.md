# Lens Flare

The camera pointed almost at the sun — a warm white burst in the upper right washing into amber across the upper half of the frame, and a smaller cooler ghost reflection sitting low-left where the inverted ray would land after bouncing inside the lens. The photo underneath stays visible but partially overwhelmed by the light at the corner closest to the sun.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/lens-flare.png)

```tsx
import { RadialGradient, Screen } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const LANDSCAPE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg";

const W = 1024;
const H = 1536;

export default function LensFlare() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Screen
				apply={
					<RadialGradient
						width={W}
						height={H}
						centerX={0.72}
						centerY={0.28}
						radius={0.6}
						stops={[
							{ color: "rgba(255, 240, 200, 1)", position: 0 },
							{ color: "rgba(255, 180, 100, 0.7)", position: 0.12 },
							{ color: "rgba(120, 60, 30, 0.4)", position: 0.45 },
							{ color: "rgba(0, 0, 0, 0)", position: 1 },
						]}
					/>
				}
			>
				<Screen
					apply={
						<RadialGradient
							width={W}
							height={H}
							centerX={0.32}
							centerY={0.68}
							radius={0.22}
							stops={[
								{ color: "rgba(180, 220, 255, 0.85)", position: 0 },
								{ color: "rgba(40, 100, 180, 0.4)", position: 0.45 },
								{ color: "rgba(0, 0, 0, 0)", position: 1 },
							]}
						/>
					}
				>
					<Image src={LANDSCAPE_URL} width={W} height={H} fit="cover" />
				</Screen>
			</Screen>
		</Canvas>
	);
}
```
