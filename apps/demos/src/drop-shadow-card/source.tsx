import { DropShadow, LinearGradient } from "@pictel/effects";
import { Canvas } from "pictel";

const W = 1280;
const H = 960;

export default function DropShadowCard() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<div style={{ position: "relative", width: W, height: H }}>
				<LinearGradient
					width={W}
					height={H}
					angle={135}
					stops={[
						{ color: "rgb(244, 232, 220)", position: 0 },
						{ color: "rgb(230, 214, 198)", position: 1 },
					]}
				/>
				<div style={{ position: "absolute", top: 0, left: 0, width: W, height: H }}>
					<DropShadow offsetX={12} offsetY={28} blurRadius={36} color="rgba(20, 20, 30, 0.45)">
						<svg width={W} height={H} xmlns="http://www.w3.org/2000/svg">
							<rect x={220} y={260} width={W - 440} height={H - 520} rx={48} fill="rgb(252, 252, 250)" />
							<circle cx={W / 2} cy={H / 2 - 40} r={42} fill="rgb(220, 70, 80)" />
							<text
								x={W / 2}
								y={H / 2 + 80}
								textAnchor="middle"
								dominantBaseline="central"
								fontFamily="Inter, 'Helvetica Neue', sans-serif"
								fontWeight={700}
								fontSize={64}
								fill="rgb(28, 28, 32)"
							>
								Pictel
							</text>
							<text
								x={W / 2}
								y={H / 2 + 150}
								textAnchor="middle"
								dominantBaseline="central"
								fontFamily="Inter, 'Helvetica Neue', sans-serif"
								fontWeight={400}
								fontSize={28}
								fill="rgb(110, 110, 118)"
							>
								agent-native image compositing
							</text>
						</svg>
					</DropShadow>
				</div>
			</div>
		</Canvas>
	);
}
