import {
	Blur,
	Brightness,
	Contrast,
	Direction,
	Duotone,
	Halftone,
	Hatch,
	Invert,
	Multiply,
	Outline,
	Saturate,
	Threshold,
} from "@pictel/effects";
import { DepthMap } from "@pictel/ml";
import { Canvas, Clip, Image, Viewer } from "pictel";
import cityPhoto from "../../assets/city overview.jpg";
import goldenHour from "../../assets/Golden Hour Portrait.jpg";
import headshot from "../../assets/headshot.jpg";

const OIL_INK: [number, number, number] = [38, 30, 54];
const OIL_PAPER: [number, number, number] = [240, 234, 220];

export default function ReadmeEntry() {
	return (
		<Viewer>
			<Canvas name="oil-painting-before" dimensions={{ width: 640, height: 640 }}>
				<Image src={headshot} width={640} height={640} fit="cover" crossOrigin="anonymous" />
			</Canvas>
			<Canvas name="oil-painting-after" dimensions={{ width: 640, height: 640 }}>
				<Duotone dark={OIL_INK} light={OIL_PAPER}>
					<Hatch
						bands={4}
						spacing={[5, 8, 12, 16]}
						length={24}
						uniformStep
						map={
							<Direction mode="structure">
								<Image src={headshot} width={640} height={640} fit="cover" crossOrigin="anonymous" />
							</Direction>
						}
					>
						<Image src={headshot} width={640} height={640} fit="cover" crossOrigin="anonymous" />
					</Hatch>
				</Duotone>
			</Canvas>
			<Canvas name="pop-art-before" dimensions={{ width: 640, height: 960 }}>
				<Image src={goldenHour} width={640} height={960} fit="cover" crossOrigin="anonymous" />
			</Canvas>
			<Canvas name="pop-art-after" dimensions={{ width: 640, height: 960 }}>
				<Multiply
					apply={
						<Threshold threshold={140}>
							<Outline sigma={2.4} k={1.6} epsilon={0.005} phi={200}>
								<Image src={goldenHour} width={640} height={960} fit="cover" crossOrigin="anonymous" />
							</Outline>
						</Threshold>
					}
				>
					<Halftone colorMode="color" dotSize={10}>
						<Contrast amount={1.35}>
							<Saturate amount={2.4}>
								<Image src={goldenHour} width={640} height={960} fit="cover" crossOrigin="anonymous" />
							</Saturate>
						</Contrast>
					</Halftone>
				</Multiply>
			</Canvas>
			<Canvas name="tilt-shift-before" dimensions={{ width: 1024, height: 683 }}>
				<Image src={cityPhoto} width={1024} height={683} fit="cover" crossOrigin="anonymous" />
			</Canvas>
			<Canvas name="tilt-shift-after" dimensions={{ width: 1024, height: 683 }}>
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
		</Viewer>
	);
}
