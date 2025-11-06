/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Include all files that use className to ensure utilities are generated
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./App.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        jost: [
          'Jost_400Regular',
          'Jost_500Medium',
          'Jost_600SemiBold',
          'Jost_700Bold',
        ],
        poppins: [
          'Poppins_400Regular',
          'Poppins_500Medium',
          'Poppins_600SemiBold',
          'Poppins_700Bold',
        ],
      },
    },
  },
  plugins: [],
}