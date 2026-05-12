import { Bilateral, Canvas, LuminanceBands, Multiply, Outline, Saturate, Threshold } from "pictel";
import headshot from "../../assets/headshot.jpg";

const canvasW = 512;
const canvasH = 512;

/**
 * Cel-shaded base — Bilateral → LuminanceBands → Saturate.
 * Line art Multiply'd over via apply — Outline (XDoG) → Threshold for hard
 * binary outlines, multiplied into the base.
 */
export default function CelShade() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<Multiply
				apply={
					<Threshold threshold={128}>
						<Outline sigma={1.0} k={1.6} epsilon={0.01} phi={200}>
							<img src={headshot} crossOrigin="anonymous" style={{ display: "block", width: canvasW, height: canvasH, objectFit: "cover" }} />
						</Outline>
					</Threshold>
				}
			>
				<Saturate amount={1.3}>
					<LuminanceBands bands={4}>
						<Bilateral spatialSigma={2} colorSigma={30}>
							<img src={headshot} crossOrigin="anonymous" style={{ display: "block", width: canvasW, height: canvasH, objectFit: "cover" }} />
						</Bilateral>
					</LuminanceBands>
				</Saturate>
			</Multiply>
		</Canvas>
	);
}
