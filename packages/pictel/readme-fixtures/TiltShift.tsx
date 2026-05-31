import { Blur, Brightness, Contrast, Invert, Saturate } from "@pictel/effects";
import { DepthMap } from "@pictel/ml";
import { Clip, Image } from "pictel";

const CITY_OVERVIEW_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg";

export const tiltShiftDimensions = { width: 1024, height: 683 };

export const tiltShiftSourceUrl = CITY_OVERVIEW_URL;

export const TiltShiftComposition = (
	<>
		<Clip>
			<Blur
				radius={7}
				mode="parameter"
				map={
					<Invert>
						<Brightness amount={2}>
							<Contrast amount={0.35}>
								<DepthMap>
									<Image src={CITY_OVERVIEW_URL} width={1024} height={683} fit="cover" />
								</DepthMap>
							</Contrast>
						</Brightness>
					</Invert>
				}
			>
				<Saturate amount={1.1}>
					<Contrast amount={1.1}>
						<Image src={CITY_OVERVIEW_URL} width={1024} height={683} fit="cover" />
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
	</>
);
