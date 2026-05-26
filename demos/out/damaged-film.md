# Damaged Film

An evening landscape recovered from the back of a forgotten film canister. The image carries the warmth of analog stock — golden light over the horizon softened by a faint amber cast — while a sun-warmed light leak bleeds in from the upper-right corner, washing one edge of the frame in orange. Emulsion grain, scratches, and chemical degradation drift across the whole frame, the texture of an overlay print where the negative has spent too long unrefrigerated. The result is less a photograph than an artefact: a moment preserved by a medium that is itself in the act of decaying.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/damaged-film.png)

```tsx
import { Lighten, Screen } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const LANDSCAPE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg";
const DEGRADED_FILM_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/degraded-film.jpg";
const LIGHT_LEAK_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/light-leak.jpg";

const canvasW = 681;
const canvasH = 1024;
const LEAK_W = Math.round(canvasW * 0.38);
const LEAK_H = Math.round(canvasH * 0.38);
const LEAK_OFFSET_TOP = -Math.round(canvasH * 0.04);
const LEAK_OFFSET_RIGHT = -Math.round(canvasW * 0.06);

export default function DamagedFilm() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<Screen apply={<Image src={DEGRADED_FILM_URL} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />}>
				<Lighten
					opacity={0.6}
					apply={
						<div style={{ position: "relative", width: "100%", height: "100%", backgroundColor: "black" }}>
							<div
								style={{
									position: "absolute",
									top: `${String(LEAK_OFFSET_TOP)}px`,
									right: `${String(LEAK_OFFSET_RIGHT)}px`,
								}}
							>
								<Image src={LIGHT_LEAK_URL} width={LEAK_W} height={LEAK_H} fit="cover" crossOrigin="anonymous" />
							</div>
						</div>
					}
				>
					<Image src={LANDSCAPE_URL} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />
				</Lighten>
			</Screen>
		</Canvas>
	);
}
```
