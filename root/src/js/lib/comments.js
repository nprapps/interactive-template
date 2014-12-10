/*global fyre, callback, authDelegate*/
//note that these libraries require jQuery or a jQuery shim, or they will throw errors
//a no-op shim is included below, but may be disabled with the following variable:

var shim$ = !("$" in window);

if (shim$) {
  var noop = function() {};
  var ish = {
    ready: function(f) { f() }
  };
  ["append", "bind", "html", "removeClass"].forEach(function(p) { ish[p] = noop });

  window.$ = function() { return ish; };
}

var css = ["http://discussions.seattletimes.com/comments/css/st-commenting.css"];
var async = [
  "http://zor.livefyre.com/wjs/v3.0/javascripts/livefyre.js",
  "http://discussions.seattletimes.com/comments/js/livefyreembed.js",
  "https://secure.seattletimes.com/accountcenter/ssoconfig.js",
  "https://secure.seattletimes.com/accountcenter/js/cookies.js",
  "https://secure.seattletimes.com/accountcenter/js/logout.js",
  "https://secure.seattletimes.com/accountcenter/js/reauth.js",
  "https://secure.seattletimes.com/accountcenter/js/subscriptionglobals.js?1"
];

var head = document.querySelector("head");
var config = document.querySelector("script[type='livefyre-config']");
if (!config) return;
config = config.innerHTML;
config = JSON.parse(config);

css.forEach(function(url) {
  var link = document.createElement("link");
  link.type = "text/css";
  link.rel = "stylesheet";
  link.href = url;
  head.appendChild(link);
});

var scriptIndex = -1;

var configure = function() {
  fyre.conv.load({
    strings: {
      postAsButton: "Post comment",
      postReplyAsButton: "Post comment",
      signIn: "You must be logged in to leave a comment. Log in or create an account.",
      listenerCountPlural: "People Viewing",
      listenerCount: "Person Viewing",
      moderator: "Seattle Times staff",
      signOut: "Log out",
      backToComments: "View all comments"
    },
    authDelegate : authDelegate,
    network: "seattletimes.fyre.co"
  },
  [{
    app: "main",
    siteId: "316317",
    articleId: config.articleId,
    el: "livefyre-comments",
    checksum: config.checksum,
    collectionMeta: config.collectionMeta
  }], function (widget) {
    callback();
  });
};

var asyncScripts = function() {
  //console.log(this, scriptIndex);
  scriptIndex++;
  var url = async[scriptIndex];
  if (!url) {
    return configure();
  }
  var script = document.createElement("script");
  script.src = url;
  script.onload = asyncScripts;
  head.appendChild(script);
};

//load comments after 5 seconds
setTimeout(asyncScripts, 5 * 1000);