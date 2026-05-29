# Neon Sign

A handwritten neon-tube sign glowing against a deep midnight backdrop — two lines of cursive script, the headline in hot magenta-pink and the subtitle in cool cyan-blue, the strokes drawn as bare hollow lines that bloom outward into soft coloured haloes. The glass tube isn't actually present; the visible signature is the light, and the air around it picks up the spill the way a real fluorescent storefront sign lifts the night air around it.

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/neon-sign.png)

```tsx
import { Bloom } from "@pictel/effects";
import { Canvas } from "pictel";

const W = 1536;
const H = 1024;

export default function NeonSign() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Bloom threshold={0.35} radius={42} intensity={5}>
				<svg width={W} height={H} xmlns="http://www.w3.org/2000/svg">
					<rect x={0} y={0} width={W} height={H} fill="rgb(14, 10, 22)" />
					<text
						x={W / 2}
						y={H / 2 - 30}
						textAnchor="middle"
						dominantBaseline="central"
						fontFamily="'Brush Script MT', 'Lucida Handwriting', cursive"
						fontStyle="italic"
						fontWeight={700}
						fontSize={280}
						fill="none"
						stroke="rgb(255, 90, 180)"
						strokeWidth={12}
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						Pictel
					</text>
					<text
						x={W / 2}
						y={H / 2 + 180}
						textAnchor="middle"
						dominantBaseline="central"
						fontFamily="'Brush Script MT', 'Lucida Handwriting', cursive"
						fontStyle="italic"
						fontWeight={400}
						fontSize={64}
						fill="none"
						stroke="rgb(110, 220, 255)"
						strokeWidth={5}
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						open all night
					</text>
				</svg>
			</Bloom>
		</Canvas>
	);
}
```
