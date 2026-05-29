# Infrared

A landscape photographed through an infrared filter — the surreal false-colour aerochrome look. Foliage that's normally green pushes into hot pink and magenta; skies and water that were blue settle into amber and rust. The result is recognizable as the same scene but tonally inverted, the world rendered in the wavelengths the eye usually ignores.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/infrared.png)

```tsx
import { ChannelMixer, Saturate } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const LANDSCAPE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg";

const W = 1024;
const H = 1536;

const IR_MATRIX = [
	[0.0, 1.0, 0.0],
	[0.4, 0.3, 0.3],
	[1.0, 0.0, 0.0],
];

export default function Infrared() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Saturate amount={1.4} mode="parameter">
				<ChannelMixer matrix={IR_MATRIX}>
					<Image src={LANDSCAPE_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
				</ChannelMixer>
			</Saturate>
		</Canvas>
	);
}
```
