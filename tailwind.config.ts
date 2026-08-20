import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // Màu lấy từ CSS variables (đổi được từ /admin, không cần build lại)
      colors: {
        navy: {
          DEFAULT: "rgb(var(--c-navy) / <alpha-value>)",
          dark: "rgb(var(--c-navy-dark) / <alpha-value>)",
        },
        cam: {
          DEFAULT: "rgb(var(--c-cam) / <alpha-value>)",
          dark: "rgb(var(--c-cam-dark) / <alpha-value>)",
        },
        nen: "rgb(var(--c-nen) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Montserrat", "system-ui", "sans-serif"],
      },
      maxWidth: {
        "3xl": "54rem", // nới container chính (mặc định Tailwind là 48rem)
      },
    },
  },
  plugins: [],
};

export default config;
