module.exports = function(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.onload = xhr.onerror = function(e) {
    if (e.type !== "load" || xhr.status >= 400) {
      return callback(xhr);
    }
    var data = xhr.responseText;
    if (url.match(/json/)) {
      try {
        data = JSON.parse(data);
      } catch (err) { /* oh well */ }
    }
    callback(null, data);
  }
  xhr.send();
}