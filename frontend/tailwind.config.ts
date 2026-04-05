import type { Config } from "tailwindcss";

const configuracion: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/componentes/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default configuracion;
