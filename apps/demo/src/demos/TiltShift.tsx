import { DepthMap } from "@pictel/ml";
import { Blur, Brightness, Canvas, Clip, Contrast, Image, Invert, Saturate } from "pictel";
import cityPhoto from "../../assets/city overview.jpg";

const canvasW = 1024;
const canvasH = 683;

export default function TiltShift() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<Clip>
				<Blur
					radius={7}
					mode="parameter"
					map={
						<Invert>
							<Brightness amount={2}>
								<Contrast amount={0.35}>
									<DepthMap>
										<Image src={cityPhoto} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />
									</DepthMap>
								</Contrast>
							</Brightness>
						</Invert>
					}
				>
					<Saturate amount={1.1}>
						<Contrast amount={1.1}>
							<Image src={cityPhoto} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />
						</Contrast>
					</Saturate>
				</Blur>
			</Clip>
			<div
				style={{
					position: "absolute",
					inset: 0,
					boxShadow: "inset 0 0 100px 30px rgba(0,0,0,0.5)",
					pointerEvents: "none",
				}}
			/>
		</Canvas>
	);
}
