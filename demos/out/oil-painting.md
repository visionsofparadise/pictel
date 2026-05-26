# Oil Painting

A headshot rendered as an ink-and-paper portrait — the subject's features traced by hatched strokes that follow the contour of the face, recoloured to deep violet ink on warm cream paper. The look sits between an etching plate and a sketchbook study: bands of thinner-to-thicker linework collect along the jaw, brow, and beard, while the cheekbones and forehead remain open and bright. Texture without colour. Drawing without lines.

| Before | After |
| --- | --- |
| ![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg) | ![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/oil-painting.png) |

```tsx
import { Direction, Duotone, Hatch } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const HEADSHOT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const INK: [number, number, number] = [38, 30, 54];
const PAPER: [number, number, number] = [240, 234, 220];

export default function OilPainting() {
	return (
		<Canvas mode="display" dimensions={{ width: 640, height: 640 }}>
			<Duotone dark={INK} light={PAPER}>
				<Hatch
					bands={4}
					spacing={[5, 8, 12, 16]}
					length={24}
					uniformStep
					map={
						<Direction mode="structure">
							<Image src={HEADSHOT_URL} width={640} height={640} fit="cover" crossOrigin="anonymous" />
						</Direction>
					}
				>
					<Image src={HEADSHOT_URL} width={640} height={640} fit="cover" crossOrigin="anonymous" />
				</Hatch>
			</Duotone>
		</Canvas>
	);
}
```
