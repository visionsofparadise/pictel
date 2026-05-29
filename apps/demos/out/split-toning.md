# Split Toning

A portrait pushed into a classical split-toned darkroom print — cool steel-blue settled into every shadow, neutral grey holding the midtones in their original tonality, and warm wheaten gold lifting through the highlights. The tonal structure of the photograph is preserved exactly; only the colour temperature shifts across the luminance range, the way a wet-printer once tinted shadows and highlights with separate selenium and sepia baths. The result reads as a portrait, not a colour study — but a portrait that breathes between two complementary temperatures rather than the warm, even cast of an untoned print.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/split-toning.png)

```tsx
import { GradientMap } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg";

const W = 1024;
const H = 1536;

export default function SplitToning() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<GradientMap
				stops={[
					{ color: "#1a3a52", position: 0 },
					{ color: "#6b6b6b", position: 0.5 },
					{ color: "#f0d090", position: 1 },
				]}
			>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</GradientMap>
		</Canvas>
	);
}
```
