# Dot Grid Background

A purely-generated tech/marketing backdrop — a deep indigo gradient laid down first, then a faint grey grid of thin lines barely visible across it, then a sparser regular pattern of small white dots punched on top. The result is the kind of dotted-grid backdrop used behind product photography or hero sections on developer-tool landing pages: textured enough to feel intentional, restrained enough to never compete with foreground content.

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/dot-grid-bg.png)

```tsx
import { DotPattern, GridPattern, LinearGradient, Multiply, Screen } from "@pictel/effects";
import { Canvas } from "pictel";

const W = 1536;
const H = 1024;

export default function DotGridBg() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Screen
				apply={
					<DotPattern
						width={W}
						height={H}
						seed={0}
						spacing={48}
						radius={3}
						color="rgba(255, 255, 255, 0.5)"
						background="rgba(0, 0, 0, 1)"
					/>
				}
			>
				<Multiply
					apply={
						<GridPattern
							width={W}
							height={H}
							seed={0}
							spacingX={144}
							thickness={1}
							color="rgba(255, 255, 255, 0.16)"
							background="rgba(255, 255, 255, 1)"
						/>
					}
				>
					<LinearGradient
						width={W}
						height={H}
						angle={135}
						stops={[
							{ color: "rgb(22, 18, 38)", position: 0 },
							{ color: "rgb(46, 30, 80)", position: 0.5 },
							{ color: "rgb(18, 14, 30)", position: 1 },
						]}
					/>
				</Multiply>
			</Screen>
		</Canvas>
	);
}
```
