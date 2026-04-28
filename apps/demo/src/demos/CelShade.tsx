import { Bilateral, Canvas, LuminanceBands, Multiply, Outline, Saturate, Threshold } from "pictel";
import headshot from "../../assets/headshot.jpg";

const W = 512;
const H = 512;

/**
 * Behind: cel-shaded base — Bilateral → LuminanceBands → Saturate.
 * Overlay: line art Multiply'd over — Outline (XDoG) → Threshold for hard
 * binary outlines, multiplied into the base.
 */
export default function CelShade() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<div style={{ position: "relative" }}>
				<Saturate amount={1.3}>
					<LuminanceBands bands={4}>
						<Bilateral spatialSigma={2} colorSigma={30}>
							<img src={headshot} crossOrigin="anonymous" style={{ display: "block", width: W, height: H, objectFit: "cover" }} />
						</Bilateral>
					</LuminanceBands>
				</Saturate>
				<div style={{ position: "absolute", inset: 0 }}>
					<Multiply>
						<Threshold threshold={128}>
							<Outline sigma={1.0} k={1.6} epsilon={0.01} phi={200}>
								<img src={headshot} crossOrigin="anonymous" style={{ display: "block", width: W, height: H, objectFit: "cover" }} />
							</Outline>
						</Threshold>
					</Multiply>
				</div>
			</div>
		</Canvas>
	);
}
