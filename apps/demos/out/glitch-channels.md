# Glitch Channels

A cityscape that has been routed through a corrupted colour pipeline — what should be reading as red is appearing where blue should be, what should be green is showing up as red. The image is recognizable but the colour assignment is plainly wrong, the way a sensor with crossed wires or a misconfigured colour space produces. Contrast bumped slightly so the channel swap reads as dramatic rather than dingy. The data-bend / corrupted-jpg aesthetic without actual decoding artifacts — just a permuted colour map.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/glitch-channels.png)

```tsx
import { ChannelMixer, Contrast } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const CITY_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg";

const W = 1536;
const H = 1024;

const GLITCH_MATRIX = [
	[0.2, 0.1, 1.1],
	[1.0, 0.05, 0.1],
	[0.05, 1.05, 0.0],
];

export default function GlitchChannels() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Contrast amount={1.18} mode="parameter">
				<ChannelMixer matrix={GLITCH_MATRIX}>
					<Image src={CITY_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
				</ChannelMixer>
			</Contrast>
		</Canvas>
	);
}
```
