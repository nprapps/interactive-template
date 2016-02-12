var strings = {
  matches: {
    on: document.body,
    props: ["matches", "webkitMatchesSelector", "msMatchesSelector", "matchesSelector"]
  },
  requestAnimationFrame: {
    on: window,
    props: ["webkitRequestAnimationFrame", "requestAnimationFrame", "setTimeout"]
  },
  requestFullScreen: {
    on: document.body,
    props: ["webkitRequestFullscreen", "mozRequestFullScreen", "msRequestFullscreen", "requestFullscreen"]
  },
  transform: {
    on: document.body.style,
    props: ["transform", "webkitTransform"]
  },
  transformOrigin: {
    on: document.body.style,
    props: ["transformOrigin", "webkitTransformOrigin"]
  }
};

for (var k in strings) {
  var sentinel = strings[k].on;
  var props = strings[k].props;
  for (var i = 0; i < props.length; i++) {
    if (props[i] in sentinel) {
      strings[k] = props[i];
      break;
    }
  }
  if (typeof strings[k] == "object") strings[k] = null;
}

module.exports = strings;