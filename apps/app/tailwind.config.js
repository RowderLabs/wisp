/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{js,ts,jsx,tsx}", "../../packages/ui/src/**/*.{js,ts,jsx,tsx}"],
    theme: {
      extend: {
        colors: {
          neutral: '#F5F5F5'
        }
      },
    },
    plugins: [],
  };