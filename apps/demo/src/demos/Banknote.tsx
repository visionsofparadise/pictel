import { Bilateral, Brightness, Canvas, DisplacementMap, Duotone, Engrave, Image } from "pictel";
import { DepthMap, RemoveBackground } from "@pictel/ml";
import headshot from "../../assets/headshot.jpg";

const INK: [number, number, number] = [24, 56, 38];
const CREAM: [number, number, number] = [234, 230, 213];
const canvasW = 512;
const canvasH = 512;

/**
 * Banknote line engraving, composed entirely from provided effects.
 *
 *   RemoveBackground — isolate the subject.
 *   Bilateral        — smooth into clean tonal regions.
 *   Brightness       — lift the tone so the brightest region clips to white.
 *   Engrave          — convert tone into thickness-modulated engraving lines
 *                      with cross-hatched shadows (grayscale ink-on-white).
 *                      Lines are straight here (relief 0).
 *   DisplacementMap  — warp the finished engraving by the subject's DepthMap.
 *                      Depth displaces the line pattern, so the straight lines
 *                      bow and curve around the form instead of running as a
 *                      flat horizontal/vertical grid. This is the form-follow
 *                      step, done purely by composing existing effects.
 *   Duotone          — recolor to green ink on cream.
 */
export default function Banknote() {
	const subject = (
		<RemoveBackground>
			<Image src={headshot} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />
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
