/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./app/**/*.{js,ts,jsx,tsx,mdx}', // Note the addition of the `app` directory.
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',

		// Or if using `src` directory:
		'./src/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			screens: {
				'xs': '10px',
				'lg': '1280px',
			  },
			width: {
				1200: '1200px',
			},
			gridTemplateColumns: {
				'card-grid': 'repeat(auto-fill, minmax(300px, 1fr))',
				'card-grid-mobile': 'repeat(2, minmax(0, 1fr))',
				'card-grid-total': 'repeat(3, minmax(0, 1fr))',
			},
			spacing: {
				'gap-8-2.5': '32px 10px',
			  },
		},
		colors: {
			transparent: 'transparent',
			current: 'currentColor',
			metal_light: '#94A3B8',
			main_blue: '#115DE6',
		},
	},
	plugins: [],
};
