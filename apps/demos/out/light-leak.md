# Light Leak

A portrait with a warm analog light-leak burning into the lower-left corner — the kind of accidental exposure a 35mm film camera produces when the back seal degrades and a stray slice of daylight catches the un-rewound stretch of film. Warm amber light spills in along a diagonal axis, deepest where it enters the frame and fading off entirely toward the opposite corner. The original photograph stays intact in the unaffected three-quarters of the frame; the leak adds atmosphere rather than replacing content. The result is the deliberately-imperfect aesthetic that vintage-camera and Lo-Fi mobile-photo apps spent the late 2000s trying to bottle.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/light-leak.png)

```tsx
import { LinearGradient, Screen } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function LightLeak() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Screen
				apply={
					<LinearGradient
						width={W}
						height={H}
						angle={210}
						stops={[
							{ color: "rgba(0, 0, 0, 0)", position: 0 },
							{ color: "rgba(0, 0, 0, 0)", position: 0.45 },
							{ color: "rgba(255, 140, 60, 0.5)", position: 0.7 },
							{ color: "rgba(255, 220, 140, 0.85)", position: 0.92 },
							{ color: "rgba(255, 255, 220, 0.95)", position: 1 },
						]}
					/>
				}
			>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</Screen>
		</Canvas>
	);
}
```
