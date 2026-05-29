import { DropShadow, LinearGradient } from "@pictel/effects";
import { Canvas } from "pictel";

const W = 1536;
const H = 1024;

export default function GoldFoilText() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<div style={{ position: "relative", width: W, height: H }}>
				<LinearGradient
					width={W}
					height={H}
					angle={135}
					stops={[
						{ color: "rgb(18, 14, 22)", position: 0 },
						{ color: "rgb(36, 24, 38)", position: 0.5 },
						{ color: "rgb(14, 12, 18)", position: 1 },
					]}
				/>
				<div style={{ position: "absolute", top: 0, left: 0, width: W, height: H }}>
					<DropShadow offsetX={6} offsetY={14} blurRadius={22} color="rgba(0, 0, 0, 0.55)">
						<svg width={W} height={H} xmlns="http://www.w3.org/2000/svg">
							<defs>
								<linearGradient id="gold" x1="0%" y1="0%" x2="0%" y2="100%">
									<stop offset="0%" stopColor="rgb(254, 232, 168)" />
									<stop offset="35%" stopColor="rgb(232, 184, 88)" />
									<stop offset="55%" stopColor="rgb(184, 128, 36)" />
									<stop offset="80%" stopColor="rgb(248, 220, 152)" />
									<stop offset="100%" stopColor="rgb(160, 108, 28)" />
								</linearGradient>
							</defs>
							<text
								x={W / 2}
								y={H / 2}
								textAnchor="middle"
								dominantBaseline="central"
								fontFamily="'Times New Roman', Georgia, serif"
								fontWeight={900}
								fontSize={360}
								letterSpacing={4}
								fill="url(#gold)"
							>
								LUXE
							</text>
						</svg>
					</DropShadow>
				</div>
			</div>
		</Canvas>
	);
}
