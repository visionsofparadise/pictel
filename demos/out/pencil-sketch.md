# Pencil Sketch

A graphite drawing on paper — a headshot rendered as if shaded with the side of a soft pencil, the tonal modulation of hand-drawn graphite carrying the face from highlight to shadow without ever resolving into a hard edge. A second `pencil-texture.jpg` overlay carries the grain of the paper itself, visible across the whole frame: every dark passage is a stack of grey strokes, every light passage is the page showing through. The result reads less as a photograph than as a study from a sketchbook, the kind of drawing you'd find done in a single sitting with a 2B pencil and a thumb for blending.

| Before | After |
| --- | --- |
| ![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg) | ![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/pencil-sketch.png) |

```tsx
import { Blur, ColorDodge, Grayscale, Invert, Multiply } from "@pictel/effects";
import { Canvas, Clip, Image } from "pictel";

const HEADSHOT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";
const PENCIL_TEXTURE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/pencil-texture.jpg";

const canvasW = 1024;
const canvasH = 1024;

export default function PencilSketch() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<Multiply apply={<Image src={PENCIL_TEXTURE_URL} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />}>
				<ColorDodge
					apply={
						<Clip>
							<Blur radius={20}>
								<Invert>
									<Grayscale>
										<Image src={HEADSHOT_URL} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />
									</Grayscale>
								</Invert>
							</Blur>
						</Clip>
					}
				>
					<Grayscale>
						<Image src={HEADSHOT_URL} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />
					</Grayscale>
				</ColorDodge>
			</Multiply>
		</Canvas>
	);
}
```
