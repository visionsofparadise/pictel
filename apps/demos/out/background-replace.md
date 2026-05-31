# Background Replacement

A studio portrait lifted out of its original room and dropped against a candy-colored backdrop — a smooth conic sweep of warm coral, peach, sky blue, and dusk purple radiating around the figure like a painted seamless. The subject keeps every original highlight, shadow, and hair-edge detail; only the room behind them is gone. A soft drop shadow pools beneath the shoulders so the portrait reads as actually standing against the new surface rather than floating in front of it, the way a cheap composite always does.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/portrait-with-background-2.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/background-replace.png)

```tsx
import { ConicGradient, DropShadow } from "@pictel/effects";
import { RemoveBackground } from "@pictel/ml";
import { Canvas, Clip, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/portrait-with-background-2.jpg";

const canvasW = 713;
const canvasH = 1024;

export default function BackgroundReplace() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<div style={{ position: "relative" }}>
				<ConicGradient
					width={canvasW}
					height={canvasH}
					stops={[
						{ color: "#ff7e5f", position: 0 },
						{ color: "#feb47b", position: 0.3 },
						{ color: "#7ec8e3", position: 0.6 },
						{ color: "#5b6cb5", position: 1 },
					]}
				/>
				<div style={{ position: "absolute", inset: 0 }}>
					<Clip>
						<DropShadow offsetX={0} offsetY={20} blurRadius={30} color="#000000">
							<RemoveBackground>
								<Image src={PORTRAIT_URL} width={canvasW} height={canvasH} fit="contain" />
							</RemoveBackground>
						</DropShadow>
					</Clip>
				</div>
			</div>
		</Canvas>
	);
}
```
