import { Contrast, Halftone, Multiply, Outline, Saturate, Threshold } from "@pictel/effects";
import { Canvas, Image } from "pictel";
import photo from "../../assets/Golden Hour Portrait.jpg";

const canvasW = 640;
const canvasH = 960;

/**
 * Comic / pop-art treatment of a portrait — the Lichtenstein recipe.
 *
 * Two layers, multiplied so the ink lines darken the color beneath them:
 *
 * Color layer — `Halftone` in `colorMode="color"` is the color base. It lays a
 * single shared dot grid over the portrait and stamps each cell as one dot in
 * that cell's own average color, sized by its ink demand. A single grid means
 * there are no overlapping process screens that could misregister — just clean
 * comic dots. `Saturate` and `Contrast` push the color hard first so the dots
 * come out vivid and poppy.
 *
 * Ink lines — `Outline` (XDoG) traces the portrait's contours, `Threshold`
 * hardens those strokes to solid black. Multiplied over the halftone: white in
 * the line branch is transparent, so only the black strokes print through.
 */
export default function PopArt() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<Multiply
				apply={
					<Threshold threshold={140}>
						<Outline sigma={2.4} k={1.6} epsilon={0.005} phi={200}>
							<Image
								src={photo}
								width={canvasW}
								height={canvasH}
								fit="cover"
								crossOrigin="anonymous"
							/>
						</Outline>
					</Threshold>
				}
			>
				<Halftone colorMode="color" dotSize={10}>
					<Contrast amount={1.35}>
						<Saturate amount={2.4}>
							<Image
								src={photo}
								width={canvasW}
								height={canvasH}
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
