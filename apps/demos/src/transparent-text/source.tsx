import { LinearGradient, Mask } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const CITY_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg";

const W = 1536;
const H = 1024;

export default function TransparentText() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<div style={{ position: "relative", width: W, height: H }}>
				<LinearGradient
					width={W}
					height={H}
					angle={135}
					stops={[
						{ color: "rgb(20, 28, 60)", position: 0 },
						{ color: "rgb(90, 30, 110)", position: 0.55 },
						{ color: "rgb(180, 70, 90)", position: 1 },
					]}
				/>
				<div style={{ position: "absolute", top: 0, left: 0, width: W, height: H }}>
					<Mask
						source="luminance"
						map={
							<svg width={W} height={H} xmlns="http://www.w3.org/2000/svg">
								<rect x={0} y={0} width={W} height={H} fill="black" />
								<text
									x={W / 2}
									y={H / 2}
									textAnchor="middle"
									dominantBaseline="central"
									fontFamily="Impact, 'Arial Black', sans-serif"
									fontWeight={900}
									fontSize={500}
									letterSpacing={-12}
									fill="white"
								>
									CITY
								</text>
							</svg>
						}
					>
						<Image
							src={CITY_URL}
							width={W}
							height={H}
							fit="cover"
						/>
					</Mask>
				</div>
			</div>
		</Canvas>
	);
}
