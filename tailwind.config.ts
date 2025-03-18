import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}",],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: [
  				'Inter',
  				'ui-sans-serif',
  				'system-ui',
  				'sans-serif',
  				'Apple Color Emoji',
  				'Segoe UI Emoji',
  				'Segoe UI Symbol',
  				'Noto Color Emoji'
  			]
  		},
  		colors: {
  			themeBlack: '#1B2021',
  			themeBlue: '#4BB3FD',
  			themePink: '#FF0051',
  			themeRed: '#FF5353',
  			themeGreen: '#00DC39',
  			themeTextGray: '#A6A6A6',
  			themeBgGray: '#F3F4F4',
  			themeInputBg: '#E2E3E4'
  		},
  		dropShadow: {
  			customDropShadow: '0px 4px 9px rgba(0, 0, 0, 0.09)'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
