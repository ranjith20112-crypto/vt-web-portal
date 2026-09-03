/** @type {import('tailwindcss').Config} */
export default {
 content: [
   "./index.html",
   "./src/**/*.{js,jsx,ts,tsx}",
 ],
 theme: {
   extend: {
    colors: {
        deep:     '#060D1B',
        primary:  '#0A1628',
        card:     '#0F1F3A',
        accent:   '#00D4AA',
        amber:    '#F5A623',
        indigo:   '#818CF8',
        borderC:  '#1E3A5F',
      },
      fontFamily: {
        display: ["'Space Grotesk'", 'sans-serif'],
        body:    ["'DM Sans'", 'sans-serif'],
      },
   },
 },
 plugins: [],};
