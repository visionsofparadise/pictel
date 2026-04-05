import { useEffect, useRef, useState } from "react";

interface ContainerSize {
	ref: React.RefObject<HTMLDivElement | null>;
	width: number;
	height: number;
}

export function useContainerSize(): ContainerSize {
	const containerRef = useRef<HTMLDivElement>(null);
	const [size, setSize] = useState({ width: 0, height: 0 });

	useEffect(() => {
		const element = containerRef.current;

		if (!element) return;

		let frameId = 0;

		const observer = new ResizeObserver((entries) => {
			cancelAnimationFrame(frameId);

			frameId = requestAnimationFrame(() => {
				for (const entry of entries) {
					const { width, height } = entry.contentRect;
					setSize({ width, height });
				}
			});
		});

		observer.observe(element);

		return () => {
			cancelAnimationFrame(frameId);

			observer.disconnect();
		};
	}, []);

	return { ref: containerRef, ...size };
}
