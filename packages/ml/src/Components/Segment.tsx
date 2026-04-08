import type { ComponentProps } from "react";
import { Sam2, type Point } from "./Sam2";
import { SegFormer } from "./SegFormer";

interface Sam2SegmentProps extends ComponentProps<"div"> {
	model: "sam2";
	points?: Array<Point>;
	negativePoints?: Array<Point>;
	revision?: string;
	mode?: "parameter" | "mix";
	backdrop?: boolean;
	flatten?: boolean;
}

interface SegFormerSegmentProps extends ComponentProps<"div"> {
	model: "segformer";
	revision?: string;
	mode?: "parameter" | "mix";
	backdrop?: boolean;
	flatten?: boolean;
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
		const { model, ...rest } = props;

		void model;

		return <Sam2 {...rest} />;
	}

	const { model, ...rest } = props;

	void model;

	return <SegFormer {...rest} />;
}
