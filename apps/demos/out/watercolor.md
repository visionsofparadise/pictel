# Watercolor

A photograph re-rendered as a watercolour painting, with the unmistakable signature of the medium: pigment pooling at the boundaries between regions. Each transition between two tones reads as a wet edge — darker on one side of the boundary than the other, as if a loaded brush stopped there and the pigment settled where the water dried last. The pooling is asymmetric: the rim falls onto the brighter side of each boundary, not symmetrically straddling it, and its darkness is keyed to the colour distance across the edge (a green-to-orange transition pools heavily; a uniform-luminance hue shift still pools rather than disappearing as it would in a luminance-only edge pass). Inside each region the wash is smooth and slightly desaturated, the way watercolour paper drinks pigment evenly when no edge is near. The overall result reads as a painting, not as a sharpened or simplified photograph.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/watercolor.png)

```tsx
import { Bilateral, Blur, Direction, DisplacementMap, EdgeDetect, Invert, Multiply } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg";

const W = 1024;
const H = 1536;

export default function Watercolor() {
	const wash = (
		<Bilateral spatialSigma={11} colorSigma={32}>
			<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
		</Bilateral>
	);

	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Multiply
				apply={
					<Invert>
						<Blur radius={6}>
							<DisplacementMap
								useMagnitude
								scaleX={-14}
								scaleY={-14}
								map={<Direction mode="gradient" space="color">{wash}</Direction>}
							>
								<EdgeDetect space="color">{wash}</EdgeDetect>
							</DisplacementMap>
						</Blur>
					</Invert>
				}
			>
				{wash}
			</Multiply>
		</Canvas>
	);
}
```
