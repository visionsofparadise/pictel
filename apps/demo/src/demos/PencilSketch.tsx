import { Blur, Canvas, Clip, ColorDodge, Grayscale, Invert, Multiply } from "pictel";
import headshot from "../../assets/headshot.jpg";
import pencilTexture from "../../assets/Pencil Texture.jpg";

const W = 1024;
const H = 1024;

/**
 * Three layers:
 *   Behind:  Grayscale(photo) — the math sketch's "A" base.
 *   Mid:     ColorDodge of A with Blur(Invert(Grayscale)) — the dodge.
 *            Wrapped in Clip so blur bleed doesn't escape the canvas.
 *   Front:   Multiply with a real graphite-paper texture for stroke character.
 */
export default function PencilSketch() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<div style={{ position: "relative" }}>
				<Grayscale>
					<img src={headshot} crossOrigin="anonymous" style={{ display: "block", width: W, height: H, objectFit: "cover" }} />
				</Grayscale>
				<div style={{ position: "absolute", inset: 0 }}>
					<ColorDodge>
						<Clip>
							<Blur radius={20}>
								<Invert>
									<Grayscale>
										<img src={headshot} crossOrigin="anonymous" style={{ display: "block", width: W, height: H, objectFit: "cover" }} />
									</Grayscale>
								</Invert>
							</Blur>
						</Clip>
					</ColorDodge>
				</div>
				<div style={{ position: "absolute", inset: 0 }}>
					<Multiply>
						<img src={pencilTexture} crossOrigin="anonymous" style={{ display: "block", width: W, height: H, objectFit: "cover" }} />
					</Multiply>
				</div>
			</div>
		</Canvas>
	);
}
