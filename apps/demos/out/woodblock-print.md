# Woodblock Print

A portrait reissued as a woodblock-style line print on rice paper — three tiers of diagonal cross-hatching represent the tonal range, from sparse single-direction strokes in the brightest regions to dense intersecting hatch in the shadows. The line work is laid in ink-black against a warm cream paper substrate, with the paper's natural pulp texture multiplied through so the result reads as a hand-pulled relief print rather than a digital reduction.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/woodblock-print.png)

```tsx
import { Duotone, Hatch, Multiply } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";
const PAPER_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/pencil-texture.jpg";

const W = 1024;
const H = 1024;

const PI = Math.PI;
const INK: [number, number, number] = [22, 16, 12];
const RICE_PAPER: [number, number, number] = [236, 222, 198];

export default function WoodblockPrint() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Multiply
				apply={<Image src={PAPER_URL} width={W} height={H} fit="cover" />}
			>
				<Duotone dark={INK} light={RICE_PAPER}>
					<Hatch
						bands={3}
						angles={[PI / 4, -PI / 4, 0]}
						spacing={[8, 10, 14]}
					>
						<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
					</Hatch>
				</Duotone>
			</Multiply>
		</Canvas>
	);
}
```
