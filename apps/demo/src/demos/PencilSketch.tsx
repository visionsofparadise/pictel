import { Blur, ColorDodge, Grayscale, Invert, Multiply } from "@pictel/effects";
import { Canvas, Clip, Image } from "pictel";
import headshot from "../../assets/headshot.jpg";
import pencilTexture from "../../assets/Pencil Texture.jpg";

const canvasW = 1024;
const canvasH = 1024;

export default function PencilSketch() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<Multiply apply={<Image src={pencilTexture} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />}>
				<ColorDodge
					apply={
						<Clip>
							<Blur radius={20}>
								<Invert>
									<Grayscale>
										<Image src={headshot} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />
									</Grayscale>
								</Invert>
							</Blur>
						</Clip>
					}
				>
					<Grayscale>
						<Image src={headshot} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />
					</Grayscale>
				</ColorDodge>
			</Multiply>
		</Canvas>
	);
}
