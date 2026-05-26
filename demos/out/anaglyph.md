# Anaglyph 3D

A cityscape photograph pushed into stereoscopic 3D — the red channel slips left and the cyan channels slip right by an amount that grows with the depth of each pixel, so rooftops and distant towers fringe more than near streets. Viewed through red-cyan glasses the flat photo resolves into actual parallax, with foreground buildings popping forward and the horizon receding behind them. Without the glasses the image carries the classic split-color ghosting of a 1950s 3D print: every contour doubled in two complementary inks.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/anaglyph.png)

```tsx
import { ChannelMixer, DisplacementMap, LinearDodge } from "@pictel/effects";
import { DepthMap } from "@pictel/ml";
import { Canvas, Image } from "pictel";

const CITY_OVERVIEW_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg";

const canvasW = 1024;
const canvasH = 683;
const PARALLAX = 12;

const KEEP_RED: Array<Array<number>> = [
	[1, 0, 0],
	[0, 0, 0],
	[0, 0, 0],
];
const KEEP_CYAN: Array<Array<number>> = [
	[0, 0, 0],
	[0, 1, 0],
	[0, 0, 1],
];

export default function Anaglyph() {
	const depth = (
		<DepthMap>
			<Image src={CITY_OVERVIEW_URL} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />
		</DepthMap>
	);
	const photo = <Image src={CITY_OVERVIEW_URL} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />;

	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<LinearDodge
				apply={
					<ChannelMixer matrix={KEEP_CYAN}>
						<DisplacementMap map={depth} scaleX={PARALLAX} scaleY={0}>
							{photo}
						</DisplacementMap>
					</ChannelMixer>
				}
			>
				<ChannelMixer matrix={KEEP_RED}>
					<DisplacementMap map={depth} scaleX={-PARALLAX} scaleY={0}>
						{photo}
					</DisplacementMap>
				</ChannelMixer>
			</LinearDodge>
		</Canvas>
	);
}
```
