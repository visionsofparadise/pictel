# Dramatic Black & White

A landscape converted to monochrome through a heavy red-filter weighting — the classic Ansel-Adams darkroom move where a Wratten 25 red filter on the lens makes blue skies plunge to near-black while leaving foliage and earth tones in the high midtones. Cloud structure leaps off the dramatically darkened sky; green leaves read as light grey; warm rocks and skin tones hold their tonal weight. The result is a single-channel black-and-white print with the storm-light contrast that a luminance-weighted greyscale conversion can never produce.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/dramatic-bw.png)

```tsx
import { ChannelMixer, ColorGrade } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const LANDSCAPE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg";

const W = 1024;
const H = 1536;

const RED_FILTER: Array<Array<number>> = [
	[1.6, -0.3, -0.3],
	[1.6, -0.3, -0.3],
	[1.6, -0.3, -0.3],
];

export default function DramaticBw() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<ColorGrade contrast={1.35} brightness={1}>
				<ChannelMixer matrix={RED_FILTER}>
					<Image src={LANDSCAPE_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
				</ChannelMixer>
			</ColorGrade>
		</Canvas>
	);
}
```
