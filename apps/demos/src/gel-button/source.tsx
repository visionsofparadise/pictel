import { DropShadow, LinearGradient } from "@pictel/effects";
import { Canvas } from "pictel";

const W = 1024;
const H = 1024;

export default function GelButton() {
	const cx = W / 2;
	const cy = H / 2;
	const r = 320;

	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<div style={{ position: "relative", width: W, height: H }}>
				<LinearGradient
					width={W}
					height={H}
					angle={135}
					stops={[
						{ color: "rgb(28, 34, 50)", position: 0 },
						{ color: "rgb(56, 64, 92)", position: 1 },
					]}
				/>
				<div style={{ position: "absolute", inset: 0 }}>
					<DropShadow offsetX={0} offsetY={32} blurRadius={42} color="rgba(0, 0, 0, 0.55)">
						<svg width={W} height={H} xmlns="http://www.w3.org/2000/svg">
							<defs>
								<radialGradient id="body" cx="50%" cy="40%" r="60%">
									<stop offset="0%" stopColor="rgb(120, 200, 255)" />
									<stop offset="55%" stopColor="rgb(40, 120, 220)" />
									<stop offset="100%" stopColor="rgb(20, 50, 130)" />
								</radialGradient>
								<linearGradient id="gloss" x1="0%" y1="0%" x2="0%" y2="100%">
									<stop offset="0%" stopColor="rgba(255, 255, 255, 0.85)" />
									<stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
								</linearGradient>
							</defs>
							<circle cx={cx} cy={cy} r={r} fill="url(#body)" />
							<ellipse cx={cx} cy={cy - r * 0.45} rx={r * 0.78} ry={r * 0.32} fill="url(#gloss)" />
							<text
								x={cx}
								y={cy + 20}
								textAnchor="middle"
								dominantBaseline="central"
								fontFamily="'Helvetica Neue', Arial, sans-serif"
								fontWeight={800}
								fontSize={92}
								letterSpacing={4}
								fill="rgb(248, 252, 255)"
							>
								GO
							</text>
						</svg>
					</DropShadow>
				</div>
			</div>
		</Canvas>
	);
}
