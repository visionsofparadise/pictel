import { DepthMap } from "@pictel/ml";
import { Blur, Brightness, Canvas, Contrast, Invert, Map, Saturate } from "pictel";
import cityPhoto from "../../assets/city overview.jpg";

export default function TiltShift() {
	return (
		<Canvas mode="display">
			<Blur
				radius={7}
				mode="parameter"
			>
				<Map>
					<Invert>
						<Brightness amount={2}>
							<Contrast amount={0.35}>
								<DepthMap>
									<img
										src={cityPhoto}
										crossOrigin="anonymous"
										style={{ display: "block", maxWidth: "100%" }}
									/>
								</DepthMap>
							</Contrast>
						</Brightness>
					</Invert>
				</Map>
				<Saturate amount={1.1}>
					<Contrast amount={1.1}>
						<img
							src={cityPhoto}
							crossOrigin="anonymous"
							style={{ display: "block", maxWidth: "100%" }}
						/>
					</Contrast>
				</Saturate>
			</Blur>
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
