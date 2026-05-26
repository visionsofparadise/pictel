export const MODES = ["preview", "display", "render"] as const;

export type Mode = (typeof MODES)[number];

export const DEFAULT_MODE: Mode = "preview";
