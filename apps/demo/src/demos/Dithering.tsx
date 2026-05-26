import { Quantize } from "@pictel/effects";
import { Canvas, Image } from "pictel";
import headshot from "../../assets/headshot.jpg";

const MAC_BW = [[0, 0, 0], [255, 255, 255]] as const;
const GAMEBOY = [[15, 56, 15], [48, 98, 48], [139, 172, 15], [155, 188, 15]] as const;

const SIZE = 192;

export default function Dithering() {
	return (
		<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, imageRendering: "pixelated" }}>
			<Canvas mode="display" dimensions={{ width: SIZE, height: SIZE }}>
				<Quantize palette={MAC_BW} dither="atkinson">
					<Image src={headshot} width={SIZE} height={SIZE} fit="cover" crossOrigin="anonymous" />
				</Quantize>
			</Canvas>
			<Canvas mode="display" dimensions={{ width: SIZE, height: SIZE }}>
				<Quantize palette={GAMEBOY} dither="floyd-steinberg">
					<Image src={headshot} width={SIZE} height={SIZE} fit="cover" crossOrigin="anonymous" />
				</Quantize>
			</Canvas>
			<Canvas mode="display" dimensions={{ width: SIZE, height: SIZE }}>
				<Quantize count={16} dither="bayer-4">
					<Image src={headshot} width={SIZE} height={SIZE} fit="cover" crossOrigin="anonymous" />
				</Quantize>
			</Canvas>
			<Canvas mode="display" dimensions={{ width: SIZE, height: SIZE }}>
				<Quantize count={32} dither="floyd-steinberg">
					<Image src={headshot} width={SIZE} height={SIZE} fit="cover" crossOrigin="anonymous" />
				</Quantize>
			</Canvas>
		</div>
	);
}
