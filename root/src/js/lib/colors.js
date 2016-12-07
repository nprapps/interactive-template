var rgb = (r, g, b) => `rgb(${r | 0}, ${g | 0}, ${b | 0})`;
var rgba = (r, g, b, a) => `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${a || 1})`;
var hsl = (h, s, l) => `hsl(${h}, ${s}%, ${l}%)`;

var components = {
  stLightRed: [229, 175, 155],
  stDarkRed: [202, 105, 81],
  stLightOrange: [255, 218, 162],
  stDarkOrange: [248, 158, 93],
  stLightGreen: [181, 191, 169],
  stDarkGreen: [121, 143, 113],
  stLightBlue: [213, 228, 240],
  stDarkBlue: [163, 193, 221],
  stLightPurple: [199, 187, 220],
  stDarkPurple: [123, 90, 166],

  // Neutral shades
  dfOffBlack: [35, 31, 32],
  dfOffWhite: [248, 248, 248],
  dfFooterGray: [239, 239, 239],
  dfLightGray: [224, 224, 224],
  dfBorderGray: [192, 192, 192],
  dfMiddleGray: [126, 131, 139],
  dfDarkGray: [66, 70, 72],
  dfCharcoal: [34, 34, 34],

  // Accent colors
  dfBlue: [7, 119, 179],
  dfMaroon: [192, 33, 138],
  dfOrange: [188, 92, 35],
  dfOrangeHighlight: [208, 103, 35],
  dfGoldenrod: [225, 135, 39],
  dfNavy: [43, 77, 112]
}

var palette = {};

for (var key in components) palette[key] = rgb.apply(null, components[key]);

module.exports = { rgb, rgba, hsl, palette, components };