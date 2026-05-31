# Soft Focus

A portrait given the classic glamour-magazine soft-focus halo — the sharp original is still readable underneath, but a diffuse glow lifts the highlights and softens the transitions in skin tone. Pores and small contrast detail are subdued without the face going actually out-of-focus. The effect reads as a warm filtered diffusion in front of the lens, the way a 70s portraitist would clip a Hasselblad with a Softar.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/soft-focus.png)

```tsx
import { Blur, Screen } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg";

const W = 1024;
const H = 1536;

export default function SoftFocus() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Screen
				apply={
					<Blur radius={28}>
						<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
					</Blur>
				}
			>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
			</Screen>
		</Canvas>
	);
}
```
