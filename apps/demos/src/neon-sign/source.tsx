import { Bloom } from "@pictel/effects";
import { Canvas } from "pictel";

const W = 1536;
const H = 1024;

export default function NeonSign() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Bloom threshold={0.35} radius={42} intensity={5}>
				<svg width={W} height={H} xmlns="http://www.w3.org/2000/svg">
					<rect x={0} y={0} width={W} height={H} fill="rgb(14, 10, 22)" />
					<text
						x={W / 2}
						y={H / 2 - 30}
						textAnchor="middle"
						dominantBaseline="central"
						fontFamily="'Brush Script MT', 'Lucida Handwriting', cursive"
						fontStyle="italic"
						fontWeight={700}
						fontSize={280}
						fill="none"
						stroke="rgb(255, 90, 180)"
						strokeWidth={12}
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						Pictel
					</text>
					<text
						x={W / 2}
						y={H / 2 + 180}
						textAnchor="middle"
						dominantBaseline="central"
						fontFamily="'Brush Script MT', 'Lucida Handwriting', cursive"
						fontStyle="italic"
						fontWeight={400}
						fontSize={64}
						fill="none"
						stroke="rgb(110, 220, 255)"
						strokeWidth={5}
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						open all night
					</text>
				</svg>
			</Bloom>
		</Canvas>
	);
}
