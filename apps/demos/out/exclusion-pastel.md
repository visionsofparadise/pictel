# Exclusion Pastel

A landscape pulled into a soft, lower-contrast pastel register — the original deep tones flatten toward midtone, and a sweeping pastel gradient running through aqua, dusty pink, and pale green is folded into the photo by exclusion, so neither layer dominates. The result is gentler than a hard tint and less psychedelic than a full hue rotation: a calm, faded palette overlaid on a recognizable scene. The look of a dream-pop album sleeve or a faded postcard.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/exclusion-pastel.png)

```tsx
import { Exclusion, LinearGradient } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const LANDSCAPE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg";

const W = 1024;
const H = 1536;

export default function ExclusionPastel() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Exclusion
				apply={
					<LinearGradient
						width={W}
						height={H}
						angle={135}
						stops={[
							{ color: "rgb(140, 200, 220)", position: 0 },
							{ color: "rgb(220, 180, 200)", position: 0.5 },
							{ color: "rgb(180, 220, 160)", position: 1 },
						]}
					/>
				}
			>
				<Image src={LANDSCAPE_URL} width={W} height={H} fit="cover" />
			</Exclusion>
		</Canvas>
	);
}
```
