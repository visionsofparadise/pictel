# SVG on Concrete

A vector mark stamped onto a rough concrete wall — the kind of stencil-and-spray-paint look you'd see on a loading-dock door or behind a building site hoarding. The mark itself is a simple geometric glyph (a secondary vector source layered over the wall), warm orange against the cold grey plaster. Critically the ink isn't flat: the wall's pits and ridges deform the shape, so the glyph bleeds into the depressions and sits proud on the raised aggregate, the way real stamped ink behaves on uneven masonry. Tactile, weathered, urban.

| Before | After |
| --- | --- |
| ![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/wall.jpg) | ![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/svg-on-concrete.png) |

```tsx
import { DisplacementMap, Overlay } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const WALL_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/wall.jpg";
const MARK_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/mark.svg";

const canvasW = 1024;
const canvasH = 576;

const MARK_SIZE = 200;
const MARK_OFFSET_TOP = 48;
const MARK_OFFSET_RIGHT = 340;

export default function SvgOnConcrete() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<Overlay
				apply={
					<DisplacementMap
						scaleX={6}
						scaleY={6}
						map={<Image src={WALL_URL} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />}
					>
						<div style={{ position: "relative", width: `${String(canvasW)}px`, height: `${String(canvasH)}px` }}>
							<div
								style={{
									position: "absolute",
									top: `${String(MARK_OFFSET_TOP)}px`,
									right: `${String(MARK_OFFSET_RIGHT)}px`,
									opacity: 0.95,
									filter: "invert(0.2) sepia(1) saturate(6) hue-rotate(-20deg)",
								}}
							>
								<Image src={MARK_URL} width={MARK_SIZE} height={MARK_SIZE} fit="contain" />
							</div>
						</div>
					</DisplacementMap>
				}
			>
				<Image src={WALL_URL} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />
			</Overlay>
		</Canvas>
	);
}
```
