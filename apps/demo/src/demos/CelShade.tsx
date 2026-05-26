import { Bilateral, LuminanceBands, Multiply, Outline, Saturate, Threshold } from "@pictel/effects";
import { Canvas, Image } from "pictel";
import headshot from "../../assets/headshot.jpg";

const canvasW = 512;
const canvasH = 512;

/**
 * Cel / toon shading. The look has two non-negotiable parts: flat banded fills
 * AND bold ink outlines — banding alone is just a posterize.
 *
 * Fill branch: Bilateral smooths texture into clean regions, LuminanceBands
 * collapses tone into 3 flat tiers (light / mid / shadow — a cartoon palette,
 * not a fine gradient), Saturate pushes the colors toward animation-cel
 * vividness.
 *
 * Line branch: Outline (XDoG) at a large σ traces thick strokes along the
 * subject's contours, Threshold hardens them to solid black ink. Multiply'd
 * over the fill so the outlines sit on top of the flat color.
 */
export default function CelShade() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<Multiply
				apply={
					<Threshold threshold={140}>
						<Outline sigma={2.6} k={1.6} epsilon={0.005} phi={200}>
							<Image src={headshot} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />
						</Outline>
					</Threshold>
				}
			>
				<Saturate amount={1.5}>
					<LuminanceBands bands={3}>
						<Bilateral spatialSigma={4} colorSigma={45}>
							<Image src={headshot} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />
						</Bilateral>
					</LuminanceBands>
				</Saturate>
			</Multiply>
		</Canvas>
	);
}
