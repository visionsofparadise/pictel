# Lighter Color Overlay

A portrait peppered with bright dust speckles — a thresholded noise field is laid over the photo via lighter-color, so wherever the noise is white it replaces the underlying pixel entirely (since white wins the lightness comparison everywhere), and wherever the noise is black the portrait passes through unchanged. The effect is a hard-edged white-fleck overlay, not a translucent dust pass — every dot is a clean cutout rather than a soft alpha bleed.
