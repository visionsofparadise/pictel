# Linear Light Pop

A cityscape pushed by an aggressive vertical lighting grade — the upper portion of the frame is heavily linear-burned by a deep blue cast, the bottom by a bright golden cast, and the middle band is held neutral so the photograph survives there cleanly. The blending mode pushes far enough that shadows compress into near-black at the top edge and highlights clip into near-white at the bottom edge. The look is a punchy bottom-lit cinematic grade — like the sun catching the foreground only.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/linear-light-pop.png)

```tsx
import { LinearGradient, LinearLight } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const CITY_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg";

const W = 1536;
const H = 1024;

export default function LinearLightPop() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<LinearLight
				apply={
					<LinearGradient
						width={W}
						height={H}
						angle={75}
						stops={[
							{ color: "rgb(40, 60, 130)", position: 0 },
							{ color: "rgb(128, 128, 128)", position: 0.5 },
							{ color: "rgb(220, 180, 80)", position: 1 },
						]}
					/>
				}
			>
				<Image src={CITY_URL} width={W} height={H} fit="cover" />
			</LinearLight>
		</Canvas>
	);
}
```
