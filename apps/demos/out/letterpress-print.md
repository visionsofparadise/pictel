# Letterpress Print

A stationery title plate printed on rough cream-coloured cotton paper — a strong serif headline above a slim hairline rule above a small italic byline, all in matt black ink that has soaked into the paper fibres slightly, picking up the paper's tooth wherever it sits. The look is the print-shop letterpress aesthetic on a business card or a small-press book frontispiece: heavy type, careful spacing, and a surface texture that reads as paper rather than pixel.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/pencil-texture.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/letterpress-print.png)

```tsx
import { Multiply } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PAPER_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/pencil-texture.jpg";

const W = 1536;
const H = 1024;

export default function LetterpressPrint() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Multiply
				apply={
					<Image src={PAPER_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
				}
			>
				<svg width={W} height={H} xmlns="http://www.w3.org/2000/svg">
					<rect x={0} y={0} width={W} height={H} fill="rgb(248, 240, 226)" />
					<text
						x={W / 2}
						y={H / 2 - 60}
						textAnchor="middle"
						dominantBaseline="central"
						fontFamily="'Times New Roman', Garamond, serif"
						fontWeight={700}
						fontSize={260}
						letterSpacing={2}
						fill="rgb(40, 30, 24)"
					>
						PRESS
					</text>
					<line
						x1={W * 0.3}
						y1={H * 0.62}
						x2={W * 0.7}
						y2={H * 0.62}
						stroke="rgb(40, 30, 24)"
						strokeWidth={3}
					/>
					<text
						x={W / 2}
						y={H / 2 + 160}
						textAnchor="middle"
						dominantBaseline="central"
						fontFamily="'Times New Roman', Garamond, serif"
						fontStyle="italic"
						fontWeight={400}
						fontSize={56}
						letterSpacing={6}
						fill="rgb(60, 44, 36)"
					>
						est. 2026 — pictel & co.
					</text>
				</svg>
			</Multiply>
		</Canvas>
	);
}
```
