import { LinearGradient, Recolor } from "@pictel/effects";
import { Canvas } from "pictel";

const canvasW = 256;
const canvasH = 256;

export default function RecolorAliasFixture() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<Recolor
				source={
					<LinearGradient
						width={canvasW}
						height={canvasH}
						angle={0}
						stops={[
							{ color: "#e63946", position: 0 },
							{ color: "#2a9d8f", position: 0.5 },
							{ color: "#264653", position: 1 },
						]}
					/>
				}
			>
				<LinearGradient
					width={canvasW}
					height={canvasH}
					angle={90}
					stops={[
						{ color: "#1a2e6c", position: 0 },
						{ color: "#e8c468", position: 0.5 },
						{ color: "#c3324a", position: 1 },
					]}
				/>
			</Recolor>
		</Canvas>
	);
}
