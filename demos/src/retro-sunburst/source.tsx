import { ConicGradient } from "@pictel/effects";
import { Canvas } from "pictel";

const W = 1280;
const H = 1280;

export default function RetroSunburst() {
	const stops = Array.from({ length: 24 }, (_, index) => {
		const isCream = index % 2 === 0;
		return {
			color: isCream ? "rgb(248, 232, 198)" : "rgb(202, 78, 52)",
			position: index / 24,
		};
	}).concat([{ color: "rgb(248, 232, 198)", position: 1 }]);

	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<ConicGradient
				width={W}
				height={H}
				centerX={0.5}
				centerY={0.5}
				startAngle={0}
				stops={stops}
			/>
		</Canvas>
	);
}
