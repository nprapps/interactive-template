var DataConsent = require('./lib/data-consent');

var googleAnalyticsAlreadyInitialized = false;

var setupGoogleAnalytics = function() {
  if (window.top !== window) {
		var gtagID = "G-LLLW9F9XPC" 
	}
	else 
	{
		var gtagID = "G-XK44GJHVBE" 
	}
  // Bail early if opted out of Performance and Analytics consent groups
  if (!DataConsent.hasConsentedTo(DataConsent.PERFORMANCE_AND_ANALYTICS)) return;

  var script = document.createElement("script")

  script.src = "https://www.googletagmanager.com/gtag/js?id=" + gtagID

  script.async = true;

  var script_embed = document.createElement("script")

  script_embed.innerHTML = "window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '" + gtagID + "');"

  document.head.append(script, script_embed)

if (window.top !== window) { 

		// By default Google tracks the query string, but we want to ignore it.
		var here = new URL(window.location);

		// Custom dimensions & metrics
		var parentUrl = here.searchParams.has("parentUrl") ? new URL(here.searchParams.get("parentUrl")) : "";
		var parentHostname = "";

		if (parentUrl) {
		    parentHostname = parentUrl.hostname;
		}

		var initialWidth = here.searchParams.get("initialWidth") || "";

		
		var customData = {};
        customData["dimension1"] = parentUrl;
        customData["dimension2"] = parentHostname;
        customData["dimension3"] = initialWidth;
		gtag('config', gtagID, {'custom_map': {'dimension1': 'parentUrl', 'dimension2': 'parentHostname', 'dimension3': 'initialWidth'}});
	} else { 

		// Secondary topics
		var dim6 = "";
		// Topic IDs
		var dim2 = "";

		// Google analytics doesn't accept arrays anymore, these must be strings.

		try {
		  dim6 = window.PROJECT_ANALYTICS.secondaryTopics.join(", ");
		} catch (error) {
		  console.log("PROJECT_ANALYTICS.secondaryTopics is not an array, check project.json");
		}

		try {
		  dim2 = window.PROJECT_ANALYTICS.topicIDs.join(", ");
		} catch (error) {
		  console.log("PROJECT_ANALYTICS.topicIDs is not an array, check project.json");
		}


	var customData = {};
        customData["dimension2"] = dim2;
        customData["dimension3"] = window.PROJECT_ANALYTICS.primaryTopic || "News";
        customData["dimension6"] = dim6;
		customData["dimension22"] = document.title;
	
	// // gtag('set', 'send_page_view', false);
    gtag('config', gtagID, {'custom_map': {'dimension2': '', 'dimension3': '', 'dimension6': '', 'dimension22': ''}});
	}

    gtag('event', 'page_view', customData)
  googleAnalyticsAlreadyInitialized = true;
}

// Add GA initialization to window.onload
var oldOnload = window.onload;
window.onload = (typeof window.onload != 'function') ? setupGoogleAnalytics : function() { oldOnload(); setupGoogleAnalytics(); };

// Listen for DataConsentChanged event 
document.addEventListener('npr:DataConsentChanged', () => {

  // Bail early if it's already been set up 
  if (googleAnalyticsAlreadyInitialized) return;

  // When a user opts into performance and analytics cookies, initialize GA
  if (DataConsent.hasConsentedTo(DataConsent.PERFORMANCE_AND_ANALYTICS)) {
    setupGoogleAnalytics();
  }  
});