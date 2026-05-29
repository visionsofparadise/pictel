# pictel

Pictel is a framework for Photoshop-like image editing via React code. It provides primitives for comprehensive pixel processing, live preview, and headless rendering.

## Install

```bash
npm install pictel @pictel/effects
```

## Packages

- [`@pictel/effects`](https://www.npmjs.com/package/@pictel/effects) — the effect library: colour grading, blurs, blend modes, halftone, displacement, line-integral convolution, generative sources, and more.
- [`@pictel/ml`](https://www.npmjs.com/package/@pictel/ml) — ML-powered effects via Transformers.js + WebGPU: background removal, segmentation, depth maps, and upscaling.
- [`@pictel/cli`](https://www.npmjs.com/package/@pictel/cli) — headless renderer (Puppeteer + Sharp) that exports compositions to PNG/JPEG/WebP/AVIF.

A corpus of worked examples — each a single composition with its intent, before/after images, and full source — lives in [`apps/demos/out/`](https://github.com/visionsofparadise/pictel/tree/main/apps/demos/out).

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

| Before                                                                                                                                                        | After                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <img src="https://raw.githubusercontent.com/visionsofparadise/pictel/main/packages/pictel/README-images/oil-painting-before.png" alt="Oil painting — before"> | <img src="https://raw.githubusercontent.com/visionsofparadise/pictel/main/packages/pictel/README-images/oil-painting-after.png" alt="Oil painting — after"> |

```tsx
import { Direction, Duotone, Hatch } from "@pictel/effects";
import { Canvas, Image } from "pictel";
import headshot from "../../assets/headshot.jpg";

const INK: [number, number, number] = [38, 30, 54];
const PAPER: [number, number, number] = [240, 234, 220];

export default function OilPainting() {
	return (
		<Canvas
			mode="display"
			dimensions={{ width: 640, height: 640 }}
		>
			<Duotone
				dark={INK}
				light={PAPER}
			>
				<Hatch
					bands={4}
					spacing={[5, 8, 12, 16]}
					length={24}
					uniformStep
					map={
						<Direction mode="structure">
							<Image
								src={headshot}
								width={640}
								height={640}
								fit="cover"
								crossOrigin="anonymous"
							/>
						</Direction>
					}
				>
					<Image
						src={headshot}
						width={640}
						height={640}
						fit="cover"
						crossOrigin="anonymous"
					/>
				</Hatch>
			</Duotone>
		</Canvas>
	);
}
```

### Pop Art

| Before                                                                                                                                              | After                                                                                                                                             |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| <img src="https://raw.githubusercontent.com/visionsofparadise/pictel/main/packages/pictel/README-images/pop-art-before.png" alt="Pop art — before"> | <img src="https://raw.githubusercontent.com/visionsofparadise/pictel/main/packages/pictel/README-images/pop-art-after.png" alt="Pop art — after"> |

```tsx
import { Contrast, Halftone, Multiply, Outline, Saturate, Threshold } from "@pictel/effects";
import { Canvas, Image } from "pictel";
import photo from "../../assets/Golden Hour Portrait.jpg";

export default function PopArt() {
	return (
		<Canvas
			mode="display"
			dimensions={{ width: 640, height: 960 }}
		>
			<Multiply
				apply={
					<Threshold threshold={140}>
						<Outline
							sigma={2.4}
							k={1.6}
							epsilon={0.005}
							phi={200}
						>
							<Image
								src={photo}
								width={640}
								height={960}
								fit="cover"
								crossOrigin="anonymous"
							/>
						</Outline>
					</Threshold>
				}
			>
				<Halftone
					colorMode="color"
					dotSize={10}
				>
					<Contrast amount={1.35}>
						<Saturate amount={2.4}>
							<Image
								src={photo}
								width={640}
								height={960}
								fit="cover"
								crossOrigin="anonymous"
							/>
						</Saturate>
					</Contrast>
				</Halftone>
			</Multiply>
		</Canvas>
	);
}
```

### Tilt-Shift

| Before                                                                                                                                                    | After                                                                                                                                                   |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <img src="https://raw.githubusercontent.com/visionsofparadise/pictel/main/packages/pictel/README-images/tilt-shift-before.png" alt="Tilt-shift — before"> | <img src="https://raw.githubusercontent.com/visionsofparadise/pictel/main/packages/pictel/README-images/tilt-shift-after.png" alt="Tilt-shift — after"> |

```tsx
import { Blur, Brightness, Contrast, Invert, Saturate } from "@pictel/effects";
import { DepthMap } from "@pictel/ml";
import { Canvas, Clip, Image } from "pictel";
import cityPhoto from "../../assets/city overview.jpg";

export default function TiltShift() {
	return (
		<Canvas
			mode="display"
			dimensions={{ width: 1024, height: 683 }}
		>
			<Clip>
				<Blur
					radius={7}
					mode="parameter"
					map={
						<Invert>
							<Brightness amount={2}>
								<Contrast amount={0.35}>
									<DepthMap>
										<Image
											src={cityPhoto}
											width={1024}
											height={683}
											fit="cover"
											crossOrigin="anonymous"
										/>
									</DepthMap>
								</Contrast>
							</Brightness>
						</Invert>
					}
				>
					<Saturate amount={1.1}>
						<Contrast amount={1.1}>
							<Image
								src={cityPhoto}
								width={1024}
								height={683}
								fit="cover"
								crossOrigin="anonymous"
							/>
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

### Banknote Print

| Before | After |
| --- | --- |
| <img src="https://raw.githubusercontent.com/visionsofparadise/pictel/main/packages/pictel/README-images/banknote-before.png" alt="Banknote Print — before"> | <img src="https://raw.githubusercontent.com/visionsofparadise/pictel/main/packages/pictel/README-images/banknote-after.png" alt="Banknote Print — after"> |

```tsx
import { Bilateral, Brightness, DisplacementMap, Duotone, Engrave } from "@pictel/effects";
import { DepthMap, RemoveBackground } from "@pictel/ml";
import { Canvas, Image } from "pictel";

const HEADSHOT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const INK: [number, number, number] = [24, 56, 38];
const CREAM: [number, number, number] = [234, 230, 213];
const canvasW = 512;
const canvasH = 512;

export default function Banknote() {
	const subject = (
		<RemoveBackground>
			<Image src={HEADSHOT_URL} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />
		</RemoveBackground>
	);

	return (
		<Canvas
			mode="display"
			dimensions={{ width: canvasW, height: canvasH }}
			style={{ backgroundColor: `rgb(${String(CREAM[0])}, ${String(CREAM[1])}, ${String(CREAM[2])})` }}
		>
			<Duotone dark={INK} light={CREAM}>
				<DisplacementMap scaleX={10} scaleY={14} map={<DepthMap>{subject}</DepthMap>}>
					<Engrave spacing={5} relief={0}>
						<Brightness amount={1.35}>
							<Bilateral spatialSigma={4} colorSigma={60}>
								{subject}
							</Bilateral>
						</Brightness>
					</Engrave>
				</DisplacementMap>
			</Duotone>
		</Canvas>
	);
}
```

### Night Vision

| Before | After |
| --- | --- |
| <img src="https://raw.githubusercontent.com/visionsofparadise/pictel/main/packages/pictel/README-images/night-vision-before.png" alt="Night Vision — before"> | <img src="https://raw.githubusercontent.com/visionsofparadise/pictel/main/packages/pictel/README-images/night-vision-after.png" alt="Night Vision — after"> |

```tsx
import { Contrast, Duotone, Grain, LinePattern, Multiply } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const LANDSCAPE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg";

const W = 1024;
const H = 1536;

const DARK_GREEN: [number, number, number] = [4, 18, 8];
const PHOSPHOR_GREEN: [number, number, number] = [120, 240, 110];

export default function NightVision() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Grain intensity={24} seed={6173}>
				<Multiply
					apply={
						<LinePattern
							width={W}
							height={H}
							seed={0}
							spacing={3}
							thickness={1}
							angle={0}
							color="rgb(40, 80, 30)"
							background="rgb(230, 240, 220)"
						/>
					}
				>
					<Duotone dark={DARK_GREEN} light={PHOSPHOR_GREEN}>
						<Contrast amount={1.35} mode="parameter">
							<Image src={LANDSCAPE_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
						</Contrast>
					</Duotone>
				</Multiply>
			</Grain>
		</Canvas>
	);
}
```

### Risograph Print

| Before | After |
| --- | --- |
| <img src="https://raw.githubusercontent.com/visionsofparadise/pictel/main/packages/pictel/README-images/risograph-before.png" alt="Risograph Print — before"> | <img src="https://raw.githubusercontent.com/visionsofparadise/pictel/main/packages/pictel/README-images/risograph-after.png" alt="Risograph Print — after"> |

```tsx
import { Quantize } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/portrait-with-background-1.jpg";

const W = 1024;
const H = 1536;

const RISO_PALETTE = [
	[245, 240, 230],
	[235, 60, 130],
	[40, 80, 180],
	[35, 35, 40],
] as const;

export default function RisographPrint() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Quantize palette={RISO_PALETTE} dither="bayer-8">
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</Quantize>
		</Canvas>
	);
}
```

API reference below — generated from JSDoc on the source.
