"use client";
import { extendTheme as extendJoyTheme } from "@mui/joy/styles";
import { blue, grey } from "@mui/material/colors";
import { createTheme, experimental_extendTheme as extendMuiTheme } from "@mui/material/styles";
import { Noto_Sans, Roboto } from "next/font/google";
export const roboto = Roboto({
	weight: ["300", "400", "500", "700"],
	subsets: ["latin"],
	display: "swap",
});

export const notoSans = Noto_Sans({
	weight: ["100", "200", "300", "400", "500", "600", "700"],
	subsets: ["latin"],
	display: "swap",
});

const theme = createTheme({
	typography: {
		fontFamily: notoSans.style.fontFamily,
	},
	palette: {
		primary: {
			main: "#115de6", // 기본 primary 색상
		},
		secondary: {
			main: "#f1f4f9", // 기본 secondary 색상
		},
	},
});

export const muiTheme = extendMuiTheme(theme); //theme from "../src/theme";

export const joyTheme = extendJoyTheme({
	// This is required to point to `var(--mui-*)` because we are using
	// `CssVarsProvider` from Material UI.
	cssVarPrefix: "mui",
	colorSchemes: {
		light: {
			palette: {
				primary: {
					...blue,
					solidColor: "var(--mui-palette-primary-contrastText)",
					solidBg: "var(--mui-palette-primary-main)",
					solidHoverBg: "var(--mui-palette-primary-dark)",
					plainColor: "var(--mui-palette-primary-main)",
					plainHoverBg:
						"rgba(var(--mui-palette-primary-mainChannel) / var(--mui-palette-action-hoverOpacity))",
					plainActiveBg: "rgba(var(--mui-palette-primary-mainChannel) / 0.3)",
					outlinedBorder: "rgba(var(--mui-palette-primary-mainChannel) / 0.5)",
					outlinedColor: "var(--mui-palette-primary-main)",
					outlinedHoverBg:
						"rgba(var(--mui-palette-primary-mainChannel) / var(--mui-palette-action-hoverOpacity))",
					outlinedHoverBorder: "var(--mui-palette-primary-main)",
					outlinedActiveBg: "rgba(var(--mui-palette-primary-mainChannel) / 0.3)",
				},
				neutral: {
					...grey,
				},
				// Do the same for the `danger`, `info`, `success`, and `warning` palettes,
				divider: "var(--mui-palette-divider)",
				text: {
					tertiary: "rgba(0 0 0 / 0.56)",
				},
			},
		},
		// Do the same for dark mode
		// dark: { ... }
	},
	fontFamily: {
		display: '"Nato Sans", sans-serif',
		body: '"Nato Sans", sans-serif',
	},
	shadow: {
		xs: `var(--mui-shadowRing), ${muiTheme.shadows[1]}`,
		sm: `var(--mui-shadowRing), ${muiTheme.shadows[2]}`,
		md: `var(--mui-shadowRing), ${muiTheme.shadows[4]}`,
		lg: `var(--mui-shadowRing), ${muiTheme.shadows[8]}`,
		xl: `var(--mui-shadowRing), ${muiTheme.shadows[12]}`,
	},
});

export default theme;
