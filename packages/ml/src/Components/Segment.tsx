import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { MapCompose } from "pictel";
import { Sam2, type Point } from "./Sam2";
import { SegFormer } from "./SegFormer";

interface Sam2SegmentProps extends ComponentPropsWithoutRef<"div"> {
	model: "sam2";
	points?: Array<Point>;
	negativePoints?: Array<Point>;
	revision?: string;
	mode?: "parameter" | "mix";
	backdrop?: boolean;
	compose?: MapCompose;
	flatten?: boolean;
	children?: ReactNode;
}

interface SegFormerSegmentProps extends ComponentPropsWithoutRef<"div"> {
	model: "segformer";
	revision?: string;
	mode?: "parameter" | "mix";
	backdrop?: boolean;
	compose?: MapCompose;
	flatten?: boolean;
	children?: ReactNode;
}

type SegmentProps = Sam2SegmentProps | SegFormerSegmentProps;

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
