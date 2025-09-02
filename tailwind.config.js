module.exports = {
	// Ensure Tailwind uses class strategy for dark mode
	darkMode: 'class',
	content: [
		"./index.html",
		"./src/**/*.{html,js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			fontfamily: {
				oxygen: ["EB Garamond", "serif"],
			},
		},
	},
	plugins: [],
};
