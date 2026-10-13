// Tailwind config for the store build (build.mjs passes it with -c).
// hoverOnlyWhenSupported: hover:/group-hover: styles apply only on devices with a real pointer,
// so on phones a tapped card or button does not stay in its hover state.
const path = require("node:path");

module.exports = {
  content: [path.join(__dirname, "MyPokerStore.jsx")],
  future: { hoverOnlyWhenSupported: true },
};
