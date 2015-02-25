var Share = require("./share.min.js");

new Share(".share", {
  ui: {
    flyout: "bottom left"
  },
  networks: {
    email: {
      description: window.location.href
    }
  }
});
