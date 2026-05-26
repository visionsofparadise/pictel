import { ChannelMixer, DisplacementMap, LinearDodge } from "@pictel/effects";
import { DepthMap } from "@pictel/ml";
import { Canvas, Image } from "pictel";
import cityPhoto from "../../assets/city overview.jpg";

const canvasW = 1024;
const canvasH = 683;
const PARALLAX = 12;

const KEEP_RED: Array<Array<number>> = [
	[1, 0, 0],
	[0, 0, 0],
	[0, 0, 0],
];
const KEEP_CYAN: Array<Array<number>> = [
	[0, 0, 0],
	[0, 1, 0],
	[0, 0, 1],
];

export default function Anaglyph() {
	const depth = (
		<DepthMap>
			<Image src={cityPhoto} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />
		</DepthMap>
	);
	const photo = <Image src={cityPhoto} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />;

	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<LinearDodge
				apply={
					<ChannelMixer matrix={KEEP_CYAN}>
						<DisplacementMap map={depth} scaleX={PARALLAX} scaleY={0}>
							{photo}
						</DisplacementMap>
					</ChannelMixer>
				}
			>
				<ChannelMixer matrix={KEEP_RED}>
					<DisplacementMap map={depth} scaleX={-PARALLAX} scaleY={0}>
						{photo}
					</DisplacementMap>
				</ChannelMixer>
			</LinearDodge>
		</Canvas>
	);
}
