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

		let timeoutId: ReturnType<typeof setTimeout>;

		const observer = new ResizeObserver((entries) => {
			clearTimeout(timeoutId);

			timeoutId = setTimeout(() => {
				for (const entry of entries) {
					const { width, height } = entry.contentRect;
					setSize({ width, height });
				}
			}, 150);
		});

		observer.observe(element);

		return () => {
			clearTimeout(timeoutId);

			observer.disconnect();
		};
	}, []);

	return { ref: containerRef, ...size };
}
