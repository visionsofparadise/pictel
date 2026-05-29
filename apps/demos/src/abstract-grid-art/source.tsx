import { ConicGradient, LinePattern, Multiply, Screen } from "@pictel/effects";
import { Canvas } from "pictel";

const W = 1280;
const H = 1280;

export default function AbstractGridArt() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Screen
				apply={
					<LinePattern
						width={W}
						height={H}
						seed={0}
						spacing={26}
						thickness={2}
						angle={45}
						color="rgba(255, 220, 180, 0.6)"
						background="rgba(0, 0, 0, 1)"
					/>
				}
			>
				<Multiply
					apply={
						<LinePattern
							width={W}
							height={H}
							seed={0}
							spacing={26}
							thickness={2}
							angle={-45}
							color="rgba(40, 40, 60, 1)"
							background="rgba(255, 255, 255, 1)"
						/>
					}
				>
					<ConicGradient
						width={W}
						height={H}
						centerX={0.5}
						centerY={0.5}
						startAngle={0}
						stops={[
							{ color: "rgb(120, 60, 180)", position: 0 },
							{ color: "rgb(220, 100, 90)", position: 0.33 },
							{ color: "rgb(60, 150, 200)", position: 0.66 },
							{ color: "rgb(120, 60, 180)", position: 1 },
						]}
					/>
				</Multiply>
			</Screen>
		</Canvas>
	);
}
