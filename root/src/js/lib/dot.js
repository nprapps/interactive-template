// NOTE: install dot from NPM before using this module
// duplicates EJS templating for the client, so we can share with the build process

var dot = require("dot");

dot.templateSettings.varname = "data";
dot.templateSettings.selfcontained = true;
dot.templateSettings.evaluate = /<%([\s\S]+?)%>/g;
dot.templateSettings.interpolate = /<%=([\s\S]+?)%>/g;

module.exports = dot;