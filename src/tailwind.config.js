module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{html,js,ts,jsx,tsx}", './public/index.html'
  ],
  theme: { 
    extend: {
      fontfamily: {
        garamond: ["garamond", "serif"]
      },
      colors: {
        'beige': {
          '50': '#fcf8ef',
          '100': '#f7efdc',
          '200': '#e9e0c0',
          '300': '#d9d097',
          '400': '#c9c07d',
          '500': '#b9b064',
          '600': '#a99f4b',
          '700': '#8b7f33',
          '800': '#6d6128',
          '900': '#4d421c',
          '950': '#352d14',
        },
      },
    },
  plugins: [],
  }
}