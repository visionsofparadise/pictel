import { Blur, ColorDodge, Grayscale, Invert, Multiply } from "@pictel/effects";
import { Canvas, Clip, Image } from "pictel";

const HEADSHOT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";
const PENCIL_TEXTURE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/pencil-texture.jpg";

const canvasW = 1024;
const canvasH = 1024;

export default function PencilSketch() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<Multiply apply={<Image src={PENCIL_TEXTURE_URL} width={canvasW} height={canvasH} fit="cover" />}>
				<ColorDodge
					apply={
						<Clip>
							<Blur radius={20}>
								<Invert>
									<Grayscale>
										<Image src={HEADSHOT_URL} width={canvasW} height={canvasH} fit="cover" />
									</Grayscale>
								</Invert>
							</Blur>
						</Clip>
					}
				>
					<Grayscale>
						<Image src={HEADSHOT_URL} width={canvasW} height={canvasH} fit="cover" />
					</Grayscale>
				</ColorDodge>
			</Multiply>
		</Canvas>
	);
}
