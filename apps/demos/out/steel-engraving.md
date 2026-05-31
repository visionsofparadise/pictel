# Steel Engraving

A portrait rendered as if etched on a steel plate for intaglio printing — fine horizontal lines that curve with the form of the face, thickening through the shadows and thinning out across the highlights until they vanish into the lit cheekbones. Cross-hatching darkens the deepest tones where the lines alone wouldn't carry the weight. The result reads like a frontispiece engraving from a 19th-century book, all line work and no halftone.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/steel-engraving.png)

```tsx
import { Brightness, Engrave } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const HEADSHOT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function SteelEngraving() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Engrave spacing={5} angle={0} relief={3} crossHatch={true}>
				<Brightness amount={1.2} mode="parameter">
					<Image src={HEADSHOT_URL} width={W} height={H} fit="cover" />
				</Brightness>
			</Engrave>
		</Canvas>
	);
}
```
