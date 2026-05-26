import { ChannelMixer, DisplacementMap, LinearDodge } from "@pictel/effects";
import { DepthMap } from "@pictel/ml";
import { Canvas, Image } from "pictel";
import cityPhoto from "../../assets/city overview.jpg";

const canvasW = 1024;
const canvasH = 683;

// Max horizontal eye separation in px. DisplacementMap centres displacement on
// mid-depth (gray = no shift), so mid-depth is the zero-disparity screen plane;
// nearer pops out, farther sinks in.
const PARALLAX = 12;

// ChannelMixer matrices — matrix[outChannel][inChannel].
// KEEP_RED passes the red channel and zeroes green/blue; KEEP_CYAN does the
// inverse. Adding the two isolated layers reassembles a full RGB image.
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

/**
 * Red/cyan anaglyph 3D, composed entirely from provided effects — no custom
 * pixel callback. The anaglyph is just depth-driven displacement plus channel
 * manipulation:
 *
 *   DepthMap        — estimate per-pixel depth (the displacement field).
 *   DisplacementMap — shift the photo horizontally by depth, once per eye with
 *                     opposite `scaleX` signs → a left-eye and a right-eye view.
 *   ChannelMixer    — isolate the red channel of one view and the cyan
 *                     (green+blue) channels of the other.
 *   LinearDodge     — add the two isolated layers: (R,0,0) + (0,G,B) = (R,G,B).
 *
 * View through red-cyan glasses for real parallax depth.
 */
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
