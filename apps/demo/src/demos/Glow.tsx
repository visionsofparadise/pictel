import { Bloom } from "@pictel/effects";
import { Canvas, Image } from "pictel";
import landscape from "../../assets/Evening Landscape.jpg";

const canvasW = 640;
const canvasH = 960;

/**
 * Dreamy glow over an evening landscape, composed entirely from the provided
 * Bloom effect.
 *
 *   Bloom — extracts the bright regions of the image via a quadratic
 *           soft-knee threshold on luminance, blurs them to spread the light
 *           outward, and screen-blends the blurred highlights back over the
 *           original. A low `threshold` of 0.18 is essential here: an evening
 *           landscape is dim (peak luminance ~0.72), so a higher cutoff drives
 *           the quadratic soft knee toward zero and the screen-blend becomes a
 *           near-no-op. `radius` must stay modest — the highlight regions are
 *           small, and an over-large blur averages them away to near-black,
 *           leaving an invisible glow. At `threshold` 0.15, `radius` 18 and
 *           `intensity` 6 the brighter sky and sun bloom into a strong,
 *           clearly visible halo while the shadows stay intact.
 */
export default function Glow() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<Bloom threshold={0.15} radius={18} intensity={6}>
				<Image
					src={landscape}
					width={canvasW}
					height={canvasH}
					fit="cover"
					crossOrigin="anonymous"
				/>
			</Bloom>
		</Canvas>
	);
}
