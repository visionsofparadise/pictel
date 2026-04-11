import type { ReactNode } from "react";
import { Sam2, type Point } from "./Sam2";
import { SegFormer } from "./SegFormer";

interface Sam2SegmentProps {
	model: "sam2";
	points?: Array<Point>;
	negativePoints?: Array<Point>;
	revision?: string;
	backdrop?: boolean;
	flatten?: boolean;
	children: ReactNode;
}

interface SegFormerSegmentProps {
	model: "segformer";
	revision?: string;
	backdrop?: boolean;
	flatten?: boolean;
	children: ReactNode;
}

type SegmentProps = Sam2SegmentProps | SegFormerSegmentProps;

/**
 * Discriminated union component that delegates to {@link Sam2} or {@link SegFormer} based on the `model` prop. Use `model="sam2"` for point-prompted segmentation or `model="segformer"` for automatic semantic segmentation.
 *
 * @param props
 * @category Segmentation
 */
export function Segment(props: SegmentProps) {
	if (props.model === "sam2") {
		const { model, children, ...effectProps } = props;

		void model;

		return <Sam2 {...effectProps}>{children}</Sam2>;
	}

	const { model, children, ...effectProps } = props;

	void model;

	return <SegFormer {...effectProps}>{children}</SegFormer>;
}
