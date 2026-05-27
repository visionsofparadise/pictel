import { ColorGrade } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg";

const W = 1024;
const H = 1280;
const MARGIN = 56;
const CORNER = 120;
const STROKE = 4;

const ink = "rgb(120, 88, 36)";

export default function FrameCorners() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<div style={{ position: "relative", width: W, height: H, backgroundColor: "rgb(244, 234, 214)" }}>
				<div style={{ position: "absolute", top: MARGIN, left: MARGIN, right: MARGIN, bottom: MARGIN }}>
					<ColorGrade contrast={1.05} saturation={0.78} temperature={0.5}>
						<Image
							src={PORTRAIT_URL}
							width={W - MARGIN * 2}
							height={H - MARGIN * 2}
							fit="cover"
							crossOrigin="anonymous"
						/>
					</ColorGrade>
				</div>
				<svg
					width={W}
					height={H}
					xmlns="http://www.w3.org/2000/svg"
					style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
				>
					<path d={`M${MARGIN - 16},${MARGIN + CORNER} L${MARGIN - 16},${MARGIN - 16} L${MARGIN + CORNER},${MARGIN - 16}`} stroke={ink} strokeWidth={STROKE} fill="none" strokeLinecap="square" />
					<path d={`M${W - MARGIN - CORNER},${MARGIN - 16} L${W - MARGIN + 16},${MARGIN - 16} L${W - MARGIN + 16},${MARGIN + CORNER}`} stroke={ink} strokeWidth={STROKE} fill="none" strokeLinecap="square" />
					<path d={`M${MARGIN - 16},${H - MARGIN - CORNER} L${MARGIN - 16},${H - MARGIN + 16} L${MARGIN + CORNER},${H - MARGIN + 16}`} stroke={ink} strokeWidth={STROKE} fill="none" strokeLinecap="square" />
					<path d={`M${W - MARGIN - CORNER},${H - MARGIN + 16} L${W - MARGIN + 16},${H - MARGIN + 16} L${W - MARGIN + 16},${H - MARGIN - CORNER}`} stroke={ink} strokeWidth={STROKE} fill="none" strokeLinecap="square" />
				</svg>
			</div>
		</Canvas>
	);
}
