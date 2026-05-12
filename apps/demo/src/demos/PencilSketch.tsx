import { Blur, Canvas, Clip, ColorDodge, Grayscale, Invert, Multiply } from "pictel";
import headshot from "../../assets/headshot.jpg";
import pencilTexture from "../../assets/Pencil Texture.jpg";

const canvasW = 1024;
const canvasH = 1024;

/**
 * Three layers:
 *   Behind:  Grayscale(photo) — the math sketch's "A" base.
 *   Mid:     ColorDodge of A with Blur(Invert(Grayscale)) — the dodge.
 *            Wrapped in Clip so blur bleed doesn't escape the canvas.
 *   Front:   Multiply with a real graphite-paper texture for stroke character.
 */
export default function PencilSketch() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<Multiply apply={<img src={pencilTexture} crossOrigin="anonymous" style={{ display: "block", width: canvasW, height: canvasH, objectFit: "cover" }} />}>
				<ColorDodge
					apply={
						<Clip>
							<Blur radius={20}>
								<Invert>
									<Grayscale>
										<img src={headshot} crossOrigin="anonymous" style={{ display: "block", width: canvasW, height: canvasH, objectFit: "cover" }} />
									</Grayscale>
								</Invert>
							</Blur>
						</Clip>
					}
				>
					<Grayscale>
						<img src={headshot} crossOrigin="anonymous" style={{ display: "block", width: canvasW, height: canvasH, objectFit: "cover" }} />
					</Grayscale>
				</ColorDodge>
			</Multiply>
		</Canvas>
	);
}
