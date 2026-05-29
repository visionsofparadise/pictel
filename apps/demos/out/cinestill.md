# Cinestill

A portrait pushed into the Cinestill 800T register — the tungsten-balanced motion-picture stock that famously left red halation rings around every highlight when respooled into a 35mm still camera (the anti-halation backing layer was removed for movie-camera use, so any bright point bled red light back into the surrounding emulsion). Highlights pick up a warm red bloom that spreads softly into their neighbouring midtones; the rest of the image keeps its near-natural colour balance with a mild push toward warm. Skin tones, sky, and shadow all read normally — only the lights catch fire.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/cinestill.png)

```tsx
import { Bloom, ChannelMixer, ColorGrade } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg";

const W = 1024;
const H = 1536;

const RED_BIAS_HIGHLIGHTS: Array<Array<number>> = [
	[1.25, 0, 0],
	[0, 1, 0],
	[0, 0, 1],
];

export default function Cinestill() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Bloom threshold={0.55} radius={28} intensity={1.15}>
				<ColorGrade saturation={1.05} contrast={1.08} temperature={0.05}>
					<ChannelMixer matrix={RED_BIAS_HIGHLIGHTS}>
						<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
					</ChannelMixer>
				</ColorGrade>
			</Bloom>
		</Canvas>
	);
}
```
