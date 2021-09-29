export const pageview = (href, title) => {
  let url = new URL(href);
  let _location = href.replace(url.origin, "");

  window.gtag("event", "page_view", {
    page_title: title,
    page_location: _location,
    page_path: href,
    //,
    //send_to: '<GA_MEASUREMENT_ID>'
  });
};

//export pageview;

export const outboundLink = (url) => {
  /**
   * Function that registers a click on an outbound link in Analytics.
   * This function takes a valid URL string as an argument, and uses that URL string
   * as the event label. Setting the transport method to 'beacon' lets the hit be sent
   * using 'navigator.sendBeacon' in browser that support it.
   */

  gtag("event", "click", {
    event_category: "outbound",
    event_label: url,
    transport_type: "beacon",
    event_callback: function () {
      document.location = url;
    },
  });
};

//export function outboundLink();

export const setCookies = (url) => {
  let urls = []
  if (!url) {

    urls.push("https://www.googletagmanager.com/gtag/js?id=G-60ZVCNWZDV")
    // urls.push("https://www.googletagmanager.com/gtag/js?id=G-RV2HBGXXTG")
  } else {
    urls.push(url)
  }

  for (let i=0; i<urls.length; i++) {
    var s = window.document.createElement("script");
    s.type = "text/javascript";
    s.async = "true";
    //s.src = "https://www.googletagmanager.com/gtag/js?id=G-RV2HBGXXTG";
    s.src = urls[i];
    let x = window.document.getElementsByTagName("script")[0];
    console.log(x);
    x.parentNode.insertBefore(s, x);
  }

  // // console.log("Setting cookies")
  // var s = window.document.createElement("script");
  // s.type = "text/javascript";
  // s.async = "true";
  // //s.src = "https://www.googletagmanager.com/gtag/js?id=G-RV2HBGXXTG";
  // s.src = url;
  // let x = window.document.getElementsByTagName("script")[0];
  // console.log(x);
  // x.parentNode.insertBefore(s, x);

};

export const analyticsAdded = (url) => {
  //if (!url) url = "https://www.googletagmanager.com/gtag/js?id=G-RV2HBGXXTG";
  let scripts = document.getElementsByTagName("script");
  for (let i = scripts.length; i--;) {
    if (scripts[i].src == url) return true;
  }
  return false;
};

export const sendPageviewIfConsent = (consent) => {
  if (consent == "true") {
    const ga_urls = [
      "https://www.googletagmanager.com/gtag/js?id=G-60ZVCNWZDV",
      // ,
      // "https://www.googletagmanager.com/gtag/js?id=G-RV2HBGXXTG",
    ];

    for (let i = 0; i < ga_urls.length; i++) {
      if (!analyticsAdded(ga_urls[i])) {
        setCookies(ga_urls[i]);
      }
    }
    pageview(window.location.href, document.title);
  } else {
    const cookies = document.cookie.split("; ");

    for (let i = 0; i < cookies.length; i++) {
      if (cookies[i].includes("_ga_60ZVCNWZDV")) {
        let cookieName = cookies[i].split("=");
        document.cookie = `${cookieName[0]}= ; expires = Thu, 01 Jan 1970 00:00:00 GMT`;
      }
      if (cookies[i].includes("_ga_RV2HBGXXTG")) {
        let cookieName = cookies[i].split("=");
        document.cookie = `${cookieName[0]}= ; expires = Thu, 01 Jan 1970 00:00:00 GMT`;
      }
      if (cookies[i].includes("_ga")) {
        let cookieName = cookies[i].split("=");
        document.cookie = `${cookieName[0]}= ; expires = Thu, 01 Jan 1970 00:00:00 GMT`;
      }
    }
    //document.cookie = "cookiename= ; expires = Thu, 01 Jan 1970 00:00:00 GMT"
  }
};
