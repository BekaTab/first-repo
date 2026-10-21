// Tailwind config for the store build (build.mjs passes it with -c).
// hoverOnlyWhenSupported: hover:/group-hover: styles apply only on devices with a real pointer,
// so on phones a tapped card does not stay in its hover state.
const path = require("node:path");

module.exports = {
  content: [path.join(__dirname, "LuxePetStore.jsx")],
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', "Georgia", '"Times New Roman"', "serif"],
        sans: ["Inter", "system-ui", "-apple-system", '"Segoe UI"', "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
};
