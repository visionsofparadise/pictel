# Twirl Distortion

A portrait wrung around its own centre like the classic Twirl filter. The swirl is tight and violent at the middle — the features nearest the centre stretch and rotate dramatically — and eases smoothly to stillness toward the edges, so the corners of the frame sit almost untouched. The deformation reads unmistakably as a twist that tightens inward, not a flat uniform rotation: a vortex pulling the face into itself.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/twirl-distortion.png)

```tsx
import { DisplacementMap, VectorField } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const HEADSHOT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function TwirlDistortion() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<DisplacementMap
				useMagnitude
				scaleX={110}
				scaleY={110}
				map={<VectorField pattern="tangential" magnitude="falloff" width={W} height={H} />}
			>
				<Image src={HEADSHOT_URL} width={W} height={H} fit="cover" />
			</DisplacementMap>
		</Canvas>
	);
}
```
