export const tokens = {
	color: {
		bg: "#0A0A0A",
		workspace: "#535353",
		panel: "#1B1B1B",
		panelRaised: "#262626",
		border: "#2D2D2D",
		text: "#CACACA",
		textSecondary: "#7C7C7C",
		textDisabled: "#474747",
		error: "#F87171",
		errorBg: "#281818",
		loadingOverlay: "rgba(0, 0, 0, 0.4)",
	},
	font: {
		ui: 'var(--pictel-font-ui, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif)',
		mono: 'var(--pictel-font-mono, ui-monospace, "SF Mono", "Cascadia Mono", "Roboto Mono", monospace)',
	},
	fontOptions: {
		system: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
		tahoma: 'Tahoma, Geneva, Verdana, sans-serif',
		arial: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
		helvetica: '"Helvetica Neue", Helvetica, Arial, sans-serif',
		georgia: 'Georgia, "Times New Roman", serif',
		mono: 'ui-monospace, "SF Mono", "Cascadia Mono", "Roboto Mono", monospace',
	},
	text: {
		xs: "0.6875rem",
		sm: "0.8125rem",
		md: "1rem",
	},
	space: {
		1: 4,
		2: 8,
		3: 12,
		4: 16,
		6: 24,
		8: 32,
		10: 40,
		12: 48,
		16: 64,
	},
} as const;

export type Tokens = typeof tokens;
