import { Contrast, Grayscale, HardLight, Mask } from "@pictel/effects";
import { RemoveBackground } from "@pictel/ml";
import { Canvas, Image } from "pictel";
import headshot from "../../assets/headshot.jpg";
import foil from "../../assets/Foil Texture.jpg";

const canvasW = 1024;
const canvasH = 1024;

/**
 * Foil-stamped portrait, composed entirely from provided effects:
 *   RemoveBackground — isolate the subject silhouette.
 *   Contrast → Grayscale — reduce the subject to a high-contrast relief.
 *   HardLight        — blend that relief over the iridescent foil texture:
 *                      bright relief screens the foil (catches light), dark
 *                      relief multiplies it (falls into shadow), midtones
 *                      pass through — so both the foil shimmer and the
 *                      facial form survive.
 *   Mask             — clip the result back to the subject silhouette.
 *                      Without it the opaque foil base would fill the whole
 *                      frame (W3C blend semantics make an opaque overlay
 *                      opaque everywhere it covers).
 */
export default function HolographicFoil() {
	const subject = (
		<RemoveBackground>
			<Image src={headshot} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />
		</RemoveBackground>
	);

	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<Mask map={subject}>
				<HardLight
					apply={
						<Grayscale>
							<Contrast amount={1.4}>{subject}</Contrast>
						</Grayscale>
					}
				>
					<Image src={foil} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />
				</HardLight>
			</Mask>
		</Canvas>
	);
}
