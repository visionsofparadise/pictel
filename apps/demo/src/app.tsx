import { useEffect, useState } from "react";
import { type Demo, DemoView } from "./DemoView";
import TiltShift from "./demos/TiltShift";
import tiltShiftSource from "./demos/TiltShift.tsx?raw";
import Banknote from "./demos/Banknote";
import banknoteSource from "./demos/Banknote.tsx?raw";
import LUTGrade from "./demos/LUTGrade";
import lutGradeSource from "./demos/LUTGrade.tsx?raw";
import BackgroundReplace from "./demos/BackgroundReplace";
import backgroundReplaceSource from "./demos/BackgroundReplace.tsx?raw";
import Anaglyph from "./demos/Anaglyph";
import anaglyphSource from "./demos/Anaglyph.tsx?raw";
import HolographicFoil from "./demos/HolographicFoil";
import holographicFoilSource from "./demos/HolographicFoil.tsx?raw";
import PencilSketch from "./demos/PencilSketch";
import pencilSketchSource from "./demos/PencilSketch.tsx?raw";
import DamagedFilm from "./demos/DamagedFilm";
import damagedFilmSource from "./demos/DamagedFilm.tsx?raw";
import SVGOnConcrete from "./demos/SVGOnConcrete";
import svgOnConcreteSource from "./demos/SVGOnConcrete.tsx?raw";
import CelShade from "./demos/CelShade";
import celShadeSource from "./demos/CelShade.tsx?raw";
import Dithering from "./demos/Dithering";
import ditheringSource from "./demos/Dithering.tsx?raw";
import OilPainting from "./demos/OilPainting";
import oilPaintingSource from "./demos/OilPainting.tsx?raw";
import PopArt from "./demos/PopArt";
import popArtSource from "./demos/PopArt.tsx?raw";
import LineDrawing from "./demos/LineDrawing";
import lineDrawingSource from "./demos/LineDrawing.tsx?raw";
import Glow from "./demos/Glow";
import glowSource from "./demos/Glow.tsx?raw";
import GenerativePoster from "./demos/GenerativePoster";
import generativePosterSource from "./demos/GenerativePoster.tsx?raw";
import cityPhoto from "../assets/city overview.jpg";
import headshot from "../assets/headshot.jpg";
import goldenHour from "../assets/Golden Hour Portrait.jpg";
import portraitBg from "../assets/Portrait with Background 2.jpg";
import portraitBg1 from "../assets/Portrait with Background 1.jpg";
import landscape from "../assets/Evening Landscape.jpg";
import wall from "../assets/Wall.jpg";

const demos: Array<Demo> = [
	{
		slug: "tilt-shift",
		name: "Tilt-Shift",
		description:
			"Depth-map-driven blur with contrast-adjusted depth map and saturation boost. Uses parameter-mode Blur so the kernel varies per pixel based on estimated depth.",
		original: cityPhoto,
		component: TiltShift,
		source: tiltShiftSource,
	},
	{
		slug: "banknote",
		name: "Banknote print",
		description:
			"RemoveBackground isolates the subject. Bilateral smooths it into clean tonal regions and Brightness lifts the white point. Engrave converts tone into thickness-modulated engraving lines, then DisplacementMap — driven by the subject's DepthMap — warps the straight lines so they bow around the form. Duotone recolors to green ink on cream.",
		original: headshot,
		component: Banknote,
		source: banknoteSource,
	},
	{
		slug: "lut-grade",
		name: "LUT grade",
		description:
			"A single CubeLUT applies the OrangeAndBlue grade — the canonical Hollywood Teal & Orange look — to a golden-hour portrait. Skin pushes warm orange, sky shifts cool teal.",
		original: goldenHour,
		component: LUTGrade,
		source: lutGradeSource,
	},
	{
		slug: "background-replace",
		name: "Background replacement",
		description:
			"RemoveBackground (BEN2) masks the subject. ConicGradient generates a procedural color sweep behind. DropShadow grounds the subject so it doesn't read as floating. First load downloads the BEN2 model (~50MB).",
		original: portraitBg,
		component: BackgroundReplace,
		source: backgroundReplaceSource,
	},
	{
		slug: "anaglyph",
		name: "Anaglyph 3D",
		description:
			"DepthMap (Depth Anything V2) provides per-pixel depth. A custom RasterEffect shifts the red channel left and the cyan channels right by amounts proportional to depth. View through red-cyan glasses for actual 3D parallax.",
		original: cityPhoto,
		component: Anaglyph,
		source: anaglyphSource,
	},
	{
		slug: "holographic-foil",
		name: "Holographic foil",
		description:
			"Behind: subject extracted by RemoveBackground (BEN2). Overlay: foil texture composited via Luminosity blend — takes the foil's tonal map while keeping the subject's hue/saturation. Subject's alpha channel keeps the foil tint inside the silhouette.",
		original: headshot,
		component: HolographicFoil,
		source: holographicFoilSource,
	},
	{
		slug: "pencil-sketch",
		name: "Pencil sketch",
		description:
			"Three layered passes: Grayscale base; ColorDodge of the gray with Blur(Invert(Grayscale)) (Clip'd so the blur bleed doesn't leak); Multiply with a real graphite-paper texture for stroke character.",
		original: headshot,
		component: PencilSketch,
		source: pencilSketchSource,
	},
	{
		slug: "damaged-film",
		name: "Damaged film + light leaks",
		description:
			"Three layers: landscape base, Lighten the light-leak texture over it (drops the leak's black background), then Screen the damaged-film scratches over that (white scratches show, dark base discarded).",
		original: landscape,
		component: DamagedFilm,
		source: damagedFilmSource,
	},
	{
		slug: "svg-on-concrete",
		name: "SVG on concrete",
		description:
			"Wall as the base. DisplacementMap warps the SVG mark using the wall's R/G channels as the displacement field. Multiply blends the displaced mark over the wall — icon conforms to surface variation.",
		original: wall,
		component: SVGOnConcrete,
		source: svgOnConcreteSource,
	},
	{
		slug: "cel-shade",
		name: "Cel shading",
		description:
			"Two branches in canonical layered-blend pattern: cel-shaded base (Bilateral → LuminanceBands → Saturate), then line art (Outline → Threshold) Multiply'd over it.",
		original: headshot,
		component: CelShade,
		source: celShadeSource,
	},
	{
		slug: "dithering",
		name: "Dithering",
		description:
			"Four Quantize configurations applied to the same headshot: Mac System (1-bit Atkinson), Game Boy (4-color Floyd–Steinberg), NES (16-color Bayer 4×4), GIF (32-color Floyd–Steinberg). Each config in its own Canvas, arranged 2×2.",
		original: headshot,
		component: Dithering,
		source: ditheringSource,
	},
	{
		slug: "oil-painting",
		name: "Oil Painting",
		description:
			"Direction in structure-tensor mode computes a smooth, contour-following orientation field from the headshot. Hatch then bands the portrait into tonal tiers and integrates a noise seed along that field per band — image-guided LIC — so the brushwork flows around the facial form, producing painterly, hand-painted strokes. Duotone warms the grayscale brushwork into a pigment-on-canvas palette.",
		original: headshot,
		component: OilPainting,
		source: oilPaintingSource,
	},
	{
		slug: "pop-art",
		name: "Pop art",
		description:
			"The Lichtenstein recipe in two multiplied branches. The color branch — Saturate, then Posterize to flat screen-printed steps, then Halftone to break every region into luminance-tracking dots. The ink-line branch — Outline (XDoG) traces the contours and Threshold hardens them to solid black. Multiply lays the black lines over the dotted color base.",
		original: goldenHour,
		component: PopArt,
		source: popArtSource,
	},
	{
		slug: "line-drawing",
		name: "Line drawing",
		description:
			"ShockFilter — the regularized iterative shock filter — presmooths the portrait and takes ten Osher–Rudin shock steps, steepening every edge into a true discontinuity and converging to piecewise-flat regions separated by crisp boundaries. Saturate restores color punch lost as the regions flatten and Contrast deepens the flattened tones so the edges read clearly.",
		original: portraitBg1,
		component: LineDrawing,
		source: lineDrawingSource,
	},
	{
		slug: "glow",
		name: "Glow",
		description:
			"Bloom extracts the bright regions of an evening landscape via a quadratic soft-knee threshold on luminance, blurs them to spread the light outward, and screen-blends the blurred highlights back over the original. The sky and sun bloom into a soft halo while the shadows stay intact.",
		original: landscape,
		component: Glow,
		source: glowSource,
	},
	{
		slug: "generative-poster",
		name: "Generative poster",
		description:
			"A fully generative abstract poster — no source image. A RadialGradient glowing from an off-center hot point forms the light source; a LinePattern of fine diagonal rays is Screen'd over it so the lines read as luminous beams; a ProceduralNoise grain layer is Overlay'd on top to add tactile print texture that rides the existing contrast.",
		component: GenerativePoster,
		source: generativePosterSource,
	},
];

function readSlug(): string {
	const hash = typeof window === "undefined" ? "" : window.location.hash.slice(1);

	const first = demos[0];

	return hash || (first ? first.slug : "");
}

function useHashSlug(): string {
	const [slug, setSlug] = useState(readSlug);

	useEffect(() => {
		const onHashChange = () => { setSlug(readSlug()); };

		window.addEventListener("hashchange", onHashChange);

		return () => { window.removeEventListener("hashchange", onHashChange); };
	}, []);

	return slug;
}

export function App() {
	const slug = useHashSlug();
	const first = demos[0];

	if (!first) throw new Error("demos must be non-empty");

	const active = demos.find((demo) => demo.slug === slug) ?? first;

	return (
		<div
			style={{
				minHeight: "100vh",
				backgroundColor: "#111",
				color: "#eee",
				fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
				display: "grid",
				gridTemplateColumns: "240px 1fr",
			}}
		>
			<aside
				style={{
					borderRight: "1px solid #222",
					padding: "32px 16px",
					position: "sticky",
					top: 0,
					alignSelf: "start",
					height: "100vh",
					overflowY: "auto",
				}}
			>
				<h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4, letterSpacing: "-0.02em" }}>
					Pictel
				</h1>
				<p style={{ fontSize: 12, color: "#666", marginBottom: 24 }}>Effect gallery</p>
				<nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
					{demos.map((demo) => {
						const isActive = demo.slug === active.slug;

						return (
							<a
								key={demo.slug}
								href={`#${demo.slug}`}
								style={{
									display: "block",
									padding: "8px 12px",
									borderRadius: 4,
									fontSize: 14,
									color: isActive ? "#fff" : "#aaa",
									backgroundColor: isActive ? "#222" : "transparent",
									textDecoration: "none",
								}}
							>
								{demo.name}
							</a>
						);
					})}
				</nav>
			</aside>

			<main style={{ padding: "48px 32px", maxWidth: 1000, width: "100%" }}>
				<DemoView key={active.slug} demo={active} />
			</main>
		</div>
	);
}
