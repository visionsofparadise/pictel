# pictel

A React framework for image compositing as code. Layouts, effects, blending, and ML expressed as components — rendered live in the browser, exported headlessly.

## Install

```bash
npm install pictel @pictel/effects react react-dom
```

`@pictel/ml` is optional — install it if your composition uses ML effects (segmentation, depth, upscale).

## Quick start

```tsx
import { Canvas, Clip, Image } from "pictel";
import { Blur } from "@pictel/effects";

export default () => (
  <Canvas dimensions={{ width: 800, height: 800 }}>
    <Clip>
      <Blur radius={4}>
        <Image src="/photo.jpg" />
      </Blur>
    </Clip>
  </Canvas>
);
```

## Examples

### Oil Painting

| Before | After |
|---|---|
| <img src="https://raw.githubusercontent.com/visionsofparadise/pictel/main/packages/pictel/README-images/oil-painting-before.png" alt="Oil painting — before"> | <img src="https://raw.githubusercontent.com/visionsofparadise/pictel/main/packages/pictel/README-images/oil-painting-after.png" alt="Oil painting — after"> |

```tsx
import { Direction, Duotone, Hatch } from "@pictel/effects";
import { Canvas, Image } from "pictel";
import headshot from "../../assets/headshot.jpg";

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
							<Image src={headshot} width={640} height={640} fit="cover" crossOrigin="anonymous" />
						</Direction>
					}
				>
					<Image src={headshot} width={640} height={640} fit="cover" crossOrigin="anonymous" />
				</Hatch>
			</Duotone>
		</Canvas>
	);
}
```

### Pop Art

| Before | After |
|---|---|
| <img src="https://raw.githubusercontent.com/visionsofparadise/pictel/main/packages/pictel/README-images/pop-art-before.png" alt="Pop art — before"> | <img src="https://raw.githubusercontent.com/visionsofparadise/pictel/main/packages/pictel/README-images/pop-art-after.png" alt="Pop art — after"> |

```tsx
import { Contrast, Halftone, Multiply, Outline, Saturate, Threshold } from "@pictel/effects";
import { Canvas, Image } from "pictel";
import photo from "../../assets/Golden Hour Portrait.jpg";

export default function PopArt() {
	return (
		<Canvas mode="display" dimensions={{ width: 640, height: 960 }}>
			<Multiply
				apply={
					<Threshold threshold={140}>
						<Outline sigma={2.4} k={1.6} epsilon={0.005} phi={200}>
							<Image src={photo} width={640} height={960} fit="cover" crossOrigin="anonymous" />
						</Outline>
					</Threshold>
				}
			>
				<Halftone colorMode="color" dotSize={10}>
					<Contrast amount={1.35}>
						<Saturate amount={2.4}>
							<Image src={photo} width={640} height={960} fit="cover" crossOrigin="anonymous" />
						</Saturate>
					</Contrast>
				</Halftone>
			</Multiply>
		</Canvas>
	);
}
```

### Tilt-Shift

| Before | After |
|---|---|
| <img src="https://raw.githubusercontent.com/visionsofparadise/pictel/main/packages/pictel/README-images/tilt-shift-before.png" alt="Tilt-shift — before"> | <img src="https://raw.githubusercontent.com/visionsofparadise/pictel/main/packages/pictel/README-images/tilt-shift-after.png" alt="Tilt-shift — after"> |

```tsx
import { Blur, Brightness, Contrast, Invert, Saturate } from "@pictel/effects";
import { DepthMap } from "@pictel/ml";
import { Canvas, Clip, Image } from "pictel";
import cityPhoto from "../../assets/city overview.jpg";

export default function TiltShift() {
	return (
		<Canvas mode="display" dimensions={{ width: 1024, height: 683 }}>
			<Clip>
				<Blur
					radius={7}
					mode="parameter"
					map={
						<Invert>
							<Brightness amount={2}>
								<Contrast amount={0.35}>
									<DepthMap>
										<Image src={cityPhoto} width={1024} height={683} fit="cover" crossOrigin="anonymous" />
									</DepthMap>
								</Contrast>
							</Brightness>
						</Invert>
					}
				>
					<Saturate amount={1.1}>
						<Contrast amount={1.1}>
							<Image src={cityPhoto} width={1024} height={683} fit="cover" crossOrigin="anonymous" />
						</Contrast>
					</Saturate>
				</Blur>
			</Clip>
			<div
				style={{
					position: "absolute",
					inset: 0,
					boxShadow: "inset 0 0 100px 30px rgba(0,0,0,0.5)",
					pointerEvents: "none",
				}}
			/>
		</Canvas>
	);
}
```

API reference below — generated from JSDoc on the source.
