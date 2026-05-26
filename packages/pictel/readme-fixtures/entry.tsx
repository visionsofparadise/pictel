import { Canvas, Image, Viewer } from "pictel";
import { OilPaintingComposition, oilPaintingDimensions, oilPaintingSourceUrl } from "./OilPainting";
import { PopArtComposition, popArtDimensions, popArtSourceUrl } from "./PopArt";
import { TiltShiftComposition, tiltShiftDimensions, tiltShiftSourceUrl } from "./TiltShift";

export default function ReadmeEntry() {
	return (
		<Viewer>
			<Canvas name="oil-painting-before" dimensions={oilPaintingDimensions}>
				<Image
					src={oilPaintingSourceUrl}
					width={oilPaintingDimensions.width}
					height={oilPaintingDimensions.height}
					fit="cover"
					crossOrigin="anonymous"
				/>
			</Canvas>
			<Canvas name="oil-painting-after" dimensions={oilPaintingDimensions}>
				{OilPaintingComposition}
			</Canvas>
			<Canvas name="pop-art-before" dimensions={popArtDimensions}>
				<Image
					src={popArtSourceUrl}
					width={popArtDimensions.width}
					height={popArtDimensions.height}
					fit="cover"
					crossOrigin="anonymous"
				/>
			</Canvas>
			<Canvas name="pop-art-after" dimensions={popArtDimensions}>
				{PopArtComposition}
			</Canvas>
			<Canvas name="tilt-shift-before" dimensions={tiltShiftDimensions}>
				<Image
					src={tiltShiftSourceUrl}
					width={tiltShiftDimensions.width}
					height={tiltShiftDimensions.height}
					fit="cover"
					crossOrigin="anonymous"
				/>
			</Canvas>
			<Canvas name="tilt-shift-after" dimensions={tiltShiftDimensions}>
				{TiltShiftComposition}
			</Canvas>
		</Viewer>
	);
}
