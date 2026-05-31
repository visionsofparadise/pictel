import { ColorGrade, LinePattern, Multiply } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const CITY_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg";

const W = 1536;
const H = 1024;

export default function ScanLines() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Multiply
				apply={
					<LinePattern
						width={W}
						height={H}
						seed={0}
						spacing={4}
						thickness={2}
						angle={0}
						color="rgb(30, 30, 40)"
						background="rgb(220, 220, 230)"
					/>
				}
			>
				<ColorGrade brightness={0.95} contrast={1.1} saturation={1.5} temperature={-0.3} tint={-0.2}>
					<Image src={CITY_URL} width={W} height={H} fit="cover" />
				</ColorGrade>
			</Multiply>
		</Canvas>
	);
}
