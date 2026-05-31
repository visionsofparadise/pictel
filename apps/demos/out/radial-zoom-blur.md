# Radial Zoom Blur

The explosive-zoom look of a lens punched in mid-exposure: pixels streak radially outward from a focal point on the subject's face. Right at the focal centre the image stays crisp, and the streaks lengthen the further they travel toward the frame edge, so the corners dissolve into a radial speed-burst while the eyes hold sharp. A dolly-zoom rush that drives all attention to the centre.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/radial-zoom-blur.png)

```tsx
import { ZoomBlur } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const HEADSHOT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function RadialZoomBlur() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<ZoomBlur centerX={0.5} centerY={0.42} length={66}>
				<Image src={HEADSHOT_URL} width={W} height={H} fit="cover" />
			</ZoomBlur>
		</Canvas>
	);
}
```
