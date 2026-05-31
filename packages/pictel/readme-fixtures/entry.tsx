import { Canvas, Image, Viewer } from "pictel";
import { banknoteBackground, BanknoteComposition, banknoteDimensions, banknoteSourceUrl } from "./Banknote";
import { NightVisionComposition, nightVisionDimensions, nightVisionSourceUrl } from "./NightVision";
import { OilPaintingComposition, oilPaintingDimensions, oilPaintingSourceUrl } from "./OilPainting";
import { PopArtComposition, popArtDimensions, popArtSourceUrl } from "./PopArt";
import { RisographComposition, risographDimensions, risographSourceUrl } from "./RisographPrint";
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
				/>
			</Canvas>
			<Canvas name="tilt-shift-after" dimensions={tiltShiftDimensions}>
				{TiltShiftComposition}
			</Canvas>
			<Canvas name="banknote-before" dimensions={banknoteDimensions}>
				<Image
					src={banknoteSourceUrl}
					width={banknoteDimensions.width}
					height={banknoteDimensions.height}
					fit="cover"
				/>
			</Canvas>
			<Canvas name="banknote-after" dimensions={banknoteDimensions} style={{ backgroundColor: banknoteBackground }}>
				{BanknoteComposition}
			</Canvas>
			<Canvas name="night-vision-before" dimensions={nightVisionDimensions}>
				<Image
					src={nightVisionSourceUrl}
					width={nightVisionDimensions.width}
					height={nightVisionDimensions.height}
					fit="cover"
				/>
			</Canvas>
			<Canvas name="night-vision-after" dimensions={nightVisionDimensions}>
				{NightVisionComposition}
			</Canvas>
			<Canvas name="risograph-before" dimensions={risographDimensions}>
				<Image
					src={risographSourceUrl}
					width={risographDimensions.width}
					height={risographDimensions.height}
					fit="cover"
				/>
			</Canvas>
			<Canvas name="risograph-after" dimensions={risographDimensions}>
				{RisographComposition}
			</Canvas>
		</Viewer>
	);
}
