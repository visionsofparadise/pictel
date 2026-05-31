import { ColorGrade } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg";

const W = 1280;
const H = 1280;
const CELL = W / 2;

export default function PhotoGrid() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: `${CELL}px ${CELL}px`,
					gridTemplateRows: `${CELL}px ${CELL}px`,
					width: W,
					height: H,
				}}
			>
				<ColorGrade brightness={0.95} contrast={1.2} saturation={0.65} temperature={-0.8}>
					<Image src={PORTRAIT_URL} width={CELL} height={CELL} fit="cover" />
				</ColorGrade>
				<ColorGrade brightness={1.05} contrast={1.05} saturation={1.5} temperature={1.4} tint={0.1}>
					<Image src={PORTRAIT_URL} width={CELL} height={CELL} fit="cover" />
				</ColorGrade>
				<ColorGrade brightness={0.85} contrast={1.4} saturation={0.2}>
					<Image src={PORTRAIT_URL} width={CELL} height={CELL} fit="cover" />
				</ColorGrade>
				<ColorGrade brightness={1.1} contrast={1.0} saturation={1.0} tint={-0.4}>
					<Image src={PORTRAIT_URL} width={CELL} height={CELL} fit="cover" />
				</ColorGrade>
			</div>
		</Canvas>
	);
}
