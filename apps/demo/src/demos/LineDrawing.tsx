import { Blur, Contrast, Grayscale, ShockFilter } from "@pictel/effects";
import { Canvas, Image } from "pictel";
import photo from "../../assets/Portrait with Background 1.jpg";

const canvasW = 640;
const canvasH = 960;

/**
 * "Sharpen repeatedly into a line drawing" stylization — a radical, near-poster
 * transformation composed entirely from provided effects.
 *
 *   Grayscale   — a line drawing is monochrome; converting up front means the
 *                 shock filter cannot amplify tiny per-channel differences into
 *                 colour fringing along the steepened edges.
 *   Blur        — a pre-blur (radius 8) merges fine texture so the shock filter
 *                 steepens the major structural edges into bold regions without
 *                 carving every micro-edge — tuned fine enough that the subject
 *                 stays readable.
 *   ShockFilter — the regularized iterative shock filter. Each pass presmooths
 *                 the image internally, then takes one Osher–Rudin shock step
 *                 (dilates toward the bright side of every edge, erodes toward
 *                 the dark side). Driven hard at 20 iterations, every edge
 *                 steepens into a true discontinuity and the regions between
 *                 them collapse to piecewise-flat fields with crisp boundaries.
 *   Contrast    — deepens the flattened tones so the crisp edges read as bold
 *                 black lines.
 */
export default function LineDrawing() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<Contrast amount={1.4}>
				<ShockFilter iterations={20} strength={1}>
					<Blur radius={8}>
						<Grayscale amount={1}>
							<Image
								src={photo}
								width={canvasW}
								height={canvasH}
								fit="cover"
								crossOrigin="anonymous"
							/>
						</Grayscale>
					</Blur>
				</ShockFilter>
			</Contrast>
		</Canvas>
	);
}
