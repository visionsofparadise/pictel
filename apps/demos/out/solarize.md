# Solarize (Sabattier Effect)

A studio portrait pushed through the Sabattier curve — the partial tonal reversal that early-twentieth-century darkroom photographers like Man Ray got by flashing the studio lights mid-development. The deepest shadows and the brightest highlights both resolve to a soft cream-white; the midtones plunge to near-black where they would normally have rendered as flesh and fabric. The face emerges as a graphic V-curve mask of itself: bright on either end of the luminance spectrum, dark through the middle, with a hard dividing tone where the curve crosses. The look is monochrome and strange — recognisable as a portrait, but lit by an inverted physics where mid-grey is the absence of light rather than its average.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/solarize.png)

```tsx
import { GradientMap } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const HEADSHOT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function Solarize() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<GradientMap
				stops={[
					{ color: "#f4efe2", position: 0 },
					{ color: "#1a1a1a", position: 0.5 },
					{ color: "#f4efe2", position: 1 },
				]}
			>
				<Image src={HEADSHOT_URL} width={W} height={H} fit="cover" />
			</GradientMap>
		</Canvas>
	);
}
```
