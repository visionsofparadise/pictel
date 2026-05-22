import { Canvas, Direction, Duotone, Hatch, Image } from "pictel";
import headshot from "../../assets/headshot.jpg";

const INK: [number, number, number] = [38, 30, 54];
const PAPER: [number, number, number] = [240, 234, 220];
const canvasW = 640;
const canvasH = 640;

/**
 * Painterly / oil-painting portrait whose brushstroke texture flows along the
 * facial form, composed entirely from provided effects. This is image-guided
 * LIC (line integral convolution) — the classic painterly-rendering technique
 * that turns a photograph into flowing, hand-painted-looking strokes.
 *
 *   Direction (mode="structure") — computes a smooth, contour-following
 *                                  orientation field from the structure
 *                                  tensor. Unlike the noisy per-pixel
 *                                  gradient field, this field flows coherently
 *                                  around the form, so field-aligned strokes
 *                                  can follow it.
 *   Hatch (field-aligned)        — bands the portrait into tonal tiers and,
 *                                  per band, runs an isotropic noise seed
 *                                  through LIC along the structure field, then
 *                                  sharpens it into distinct strokes. White-
 *                                  noise seeding makes the streamlines follow
 *                                  the field in every orientation, so the
 *                                  brushwork curves around the contours of the
 *                                  face — producing flowing, brushstroke-like
 *                                  texture rather than melting into vertical
 *                                  drips. Per-band `spacing` sets the stroke
 *                                  density, driving the tonal progression.
 *                                  `uniformStep` is set because the structure
 *                                  field is smooth (its B channel carries
 *                                  coherence, not magnitude, so the default
 *                                  magnitude-gated step would stall).
 *   Duotone                      — warms the grayscale brushwork into a
 *                                  pigment-on-canvas palette.
 */
export default function OilPainting() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<Duotone dark={INK} light={PAPER}>
				<Hatch
					bands={4}
					spacing={[5, 8, 12, 16]}
					length={24}
					uniformStep
					map={
						<Direction mode="structure">
							<Image
								src={headshot}
								width={canvasW}
								height={canvasH}
								fit="cover"
								crossOrigin="anonymous"
							/>
						</Direction>
					}
				>
					<Image
						src={headshot}
						width={canvasW}
						height={canvasH}
						fit="cover"
						crossOrigin="anonymous"
					/>
				</Hatch>
			</Duotone>
		</Canvas>
	);
}
