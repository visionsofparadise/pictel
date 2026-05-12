import { DepthMap } from "@pictel/ml";
import { Blur, Brightness, Canvas, Clip, Contrast, Invert, Saturate } from "pictel";
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
										<img src={cityPhoto} crossOrigin="anonymous" style={{ display: "block", width: canvasW, height: canvasH, objectFit: "cover" }} />
									</DepthMap>
								</Contrast>
							</Brightness>
						</Invert>
					}
				>
					<Saturate amount={1.1}>
						<Contrast amount={1.1}>
							<img src={cityPhoto} crossOrigin="anonymous" style={{ display: "block", width: canvasW, height: canvasH, objectFit: "cover" }} />
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
