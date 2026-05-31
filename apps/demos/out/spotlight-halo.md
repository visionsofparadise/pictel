# Spotlight Halo

A studio portrait framed by a soft cool halo of light — a thin ring of pale blue-white added by Screen-blending a radial-gradient ring at the perimeter of the centred subject, with the corners of the frame falling away into deep shadow. The subject sits in the bright central core untouched; the halo ring brightens whichever part of the subject extends to where the ring crosses the silhouette. The mood is theatrical — a follow-spot's edge catching the subject's outline, the surrounding scene falling off into a darkened stage.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/spotlight-halo.png)

```tsx
import { RadialGradient, Screen } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function SpotlightHalo() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Screen
				apply={
					<RadialGradient
						width={W}
						height={H}
						centerX={0.5}
						centerY={0.5}
						radius={0.55}
						stops={[
							{ color: "rgba(0, 0, 0, 1)", position: 0 },
							{ color: "rgba(0, 0, 0, 1)", position: 0.6 },
							{ color: "rgba(180, 195, 220, 0.75)", position: 0.92 },
							{ color: "rgba(80, 100, 140, 0)", position: 1 },
						]}
					/>
				}
			>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
			</Screen>
		</Canvas>
	);
}
```
