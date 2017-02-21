var $ = (s, d = document) => Array.prototype.slice.call(d.querySelectorAll(s));

$.one = (s, d = document) => d.querySelector(s);

module.exports = $;