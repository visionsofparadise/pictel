import { Blur, Brightness, Contrast, Invert, Saturate } from "@pictel/effects";
import { DepthMap } from "@pictel/ml";
import { Canvas, Clip, Image } from "pictel";
import cityPhoto from "../../assets/city overview.jpg";

export default function TiltShift() {
	return (
		<Canvas mode="display" dimensions={{ width: 1024, height: 683 }}>
			<Clip>
				<Blur
					radius={7}
					mode="parameter"
					map={
						<Invert>
							<Brightness amount={2}>
								<Contrast amount={0.35}>
									<DepthMap>
										<Image src={cityPhoto} width={1024} height={683} fit="cover" crossOrigin="anonymous" />
									</DepthMap>
								</Contrast>
							</Brightness>
						</Invert>
					}
				>
					<Saturate amount={1.1}>
						<Contrast amount={1.1}>
							<Image src={cityPhoto} width={1024} height={683} fit="cover" crossOrigin="anonymous" />
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
