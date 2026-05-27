import { Saturate, ShockFilter } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/portrait-with-background-1.jpg";

const W = 1024;
const H = 1536;

export default function ShockCartoon() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Saturate amount={1.35} mode="parameter">
				<ShockFilter iterations={12} strength={0.9}>
					<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
				</ShockFilter>
			</Saturate>
		</Canvas>
	);
}
