import { Canvas, Direction, Duotone, Hatch, Multiply } from "pictel";
import { RemoveBackground } from "@pictel/ml";
import headshot from "../../assets/headshot.jpg";

const INK: [number, number, number] = [26, 61, 39];
const CREAM: [number, number, number] = [232, 228, 208];
const canvasW = 512;
const canvasH = 512;

/**
 * Classic line-engraving / banknote-print technique:
 *   1. Behind: Duotone(RemoveBackground(photo)) — subject in ink-on-paper
 *      colors, background masked out.
 *   2. Overlay (Multiply'd): Hatch(field-aligned) — bands the photo into
 *      tonal tiers (Grayscale → Posterize), then for each tier draws a
 *      vertical-stripe pattern that LIC has bent along the photo's
 *      Direction field. Stripe spacing tightens with darker tiers, so
 *      shadows accumulate denser engraving lines and highlights stay
 *      blank — the same "cross-hatch density follows form" trick used on
 *      US currency portraits and similar engraved prints.
 *
 * Both branches share the same RemoveBackground'd photo so the engraving
 * lines and the duotone fall on the same silhouette.
 */
export default function Banknote() {
	const subject = (
		<RemoveBackground>
			<img src={headshot} crossOrigin="anonymous" style={{ display: "block", width: canvasW, height: canvasH, objectFit: "cover" }} />
		</RemoveBackground>
	);

	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<Multiply
				apply={
					<Hatch
						bands={4}
						spacing={[3, 5, 8, 14]}
						length={22}
						stepSize={1.4}
						map={<Direction>{subject}</Direction>}
					>
						{subject}
					</Hatch>
				}
			>
				<Duotone dark={INK} light={CREAM}>
					{subject}
				</Duotone>
			</Multiply>
		</Canvas>
	);
}
