// export default {
//   content: [
//     "./src/**/*.{js,ts,jsx,tsx}",
//     "./public/index.html"
//   ],
//   theme: {
//     extend: {},
//   },
//   darkMode: "class", // اختیاری
// }

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        modalSlideIn: {
          from: {
            opacity: "0",
            transform: "translateY(30px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      animation: {
        modalSlideIn: "modalSlideIn 0.3s ease",
          fadeIn: "fadeIn 0.3s ease-out",
        slideUp: "slideUp 0.4s cubic-bezier(0.4,0,0.2,1)",
      },
    },
  },
  plugins: [],
};
