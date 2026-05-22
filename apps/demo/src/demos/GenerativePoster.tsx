import { Canvas, LinePattern, Overlay, ProceduralNoise, RadialGradient, Screen } from "pictel";

const canvasW = 720;
const canvasH = 960;

/**
 * A fully generative abstract poster — no source image, every pixel synthesized.
 *
 * Three stacked layers, composited bottom-to-top:
 *
 * Base: a `RadialGradient` glowing from an off-center hot point — a warm
 * amber core falling off into deep ink. This is the poster's light source.
 *
 * Mid: a `LinePattern` of fine diagonal rays. `Screen`'d over the gradient,
 * the lines only lighten — they read as luminous beams over the dark falloff
 * and vanish into the bright core.
 *
 * Top: a `ProceduralNoise` grain layer, `Overlay`'d to add tactile print
 * texture — multiplying the shadows and screening the highlights so the
 * grain rides the existing contrast instead of flattening it.
 */
export default function GenerativePoster() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<Overlay
				apply={
					<ProceduralNoise
						width={canvasW}
						height={canvasH}
						type="simplex"
						seed={101}
						scale={0.5}
					/>
				}
			>
				<Screen
					apply={
						<LinePattern
							width={canvasW}
							height={canvasH}
							seed={5}
							spacing={26}
							thickness={2}
							angle={32}
							color="#e8a13c"
						/>
					}
				>
					<RadialGradient
						width={canvasW}
						height={canvasH}
						stops={[
							{ color: "#f6c970", position: 0 },
							{ color: "#c25a2e", position: 0.45 },
							{ color: "#1a1326", position: 1 },
						]}
						centerX={0.38}
						centerY={0.34}
						radius={0.9}
					/>
				</Screen>
			</Overlay>
		</Canvas>
	);
}
