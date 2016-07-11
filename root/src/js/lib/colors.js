var rgb = (r, g, b) => `rgb(${r}, ${g}, ${b})`;
var rgba = (r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${a || 1})`;
var hsl = (h, s, l) => `hsl(${h}, ${s}%, ${l}%)`;

var palette = {
  stLightRed: rgb(229, 175, 155),
  stDarkRed: rgb(202, 105, 81),
  stLightOrange: rgb(255, 218, 162),
  stDarkOrange: rgb(248, 158, 93),
  stLightGreen: rgb(181, 191, 169),
  stDarkGreen: rgb(121, 143, 113),
  stLightBlue: rgb(213, 228, 240),
  stDarkBlue: rgb(163, 193, 221),
  stLightPurple: rgb(199, 187, 220),
  stDarkPurple: rgb(123, 90, 166),

  // Neutral shades
  dfOffBlack: rgb(35, 31, 32),
  dfOffWhite: rgb(248, 248, 248),
  dfFooterGray: rgb(239, 239, 239),
  dfLightGray: rgb(224, 224, 224),
  dfBorderGray: rgb(192, 192, 192),
  dfMiddleGray: rgb(126, 131, 139),
  dfDarkGray: rgb(66, 70, 72),
  dfCharcoal: rgb(34, 34, 34),

  // Accent colors
  dfBlue: rgb(7, 119, 179),
  dfMaroon: rgb(192, 33, 138),
  dfOrange: rgb(188, 92, 35),
  dfOrangeHighlight: rgb(208, 103, 35),
  dfGoldenrod: rgb(225, 135, 39),
  dfNavy: rgb(43, 77, 112)
};

module.exports = { rgb, rgba, hsl, palette };