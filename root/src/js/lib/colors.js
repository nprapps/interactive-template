module.exports = {
  rgb: (r, g, b) => `rgb(${r}, ${g}, ${b})`,
  rgba: (r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${a || 1})`,
  hsl: (h, s, l) => `hsl(${h}, ${s}%, ${l}%)`
};