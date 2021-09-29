import React, { useRef, useState, useEffect } from "react";
import CookieConsent, { getCookieConsentValue } from "react-cookie-consent";
import mainStyles from "../css/App.module.scss";
import lipasStyles from "../css/LipasAPI/LipasAPI.module.scss";
import { sendPageviewIfConsent, setCookies } from "../helpers/GoogleAnalytics";
import Navbar from "../js/NavBar";
import settings from "../../settings.json";
import LipasAPIList from "../LipasAPI/LipasAPIList";
import MapBoxMap from "./MapBoxMap";
import {
  browserVersion,
  isAndroid,
  isFirefox,
  isIOS,
  isMobile,
  isOpera,
} from "react-device-detect";

const LipasAPI = () => {
  //Fetch Lipas settings from settings.json file
  var lipasSettings = function (settings) {
    let lipasSettings = [];
    //This path has to bee same as settings.json rssfeed module name.
    const path = "LipasAPI";
    //Fetching right settings for rss feed by path name
    lipasSettings.push(settings.settings.find((x) => x.name == path));
    return lipasSettings;
  };
  const [landscapeNotification, setLandscapeNotification] = useState(
    window.innerWidth < window.innerHeight
  );

  let moduleSettings = lipasSettings(settings);

  useEffect(() => {
    document.title = moduleSettings[0].pageTitle;
    sendPageviewIfConsent(getCookieConsentValue());

    window.addEventListener("resize", appHeight);
    appHeight();

    return () => {
      window.removeEventListener("resize", appHeight);
    };
  }, []);

  const appHeight = () => {
    document.documentElement.style.setProperty(
      "--app-height",
      `${window.innerHeight+5}px`
    );

    if (isAndroid || isIOS) {
      if (window.innerHeight < window.innerWidth) {
        setLandscapeNotification(true);
      } else {
        setLandscapeNotification(false);
      }
    }
  };

  let categories = moduleSettings[0].settings.categories;
  function loadListView(category) {
    return (
      <LipasAPIList
        categoryName={category}
        noDataMsg={moduleSettings[0].popUpDataNotAvailable}
      ></LipasAPIList>
    );
  }
  return (
    <>
      <header className={mainStyles.AppHeader}>
        <Navbar />
        <CookieConsent
          enableDeclineButton
          flipButtons
          buttonText="Salli evästeet"
          containerClasses={mainStyles.CookieButton}
          declineButtonText="Älä salli evästeitä"
          ariaAcceptLabel="Salli evästeet"
          ariaDeclineLabel="Älä salli evästeitä"
          onAccept={() => {
            setCookies();
          }}
        >
          Käytämme sivustolla evästeitä. Sallimalla evästeet keräämme anonyymejä
          käyttötilastoja.
        </CookieConsent>
      </header>
      <div
        id="App-container"
        className={[mainStyles.AppContainer, "container"].join(" ")}
        style={{ marginTop: "-65px" }}
      >
        <div className={lipasStyles.MainContent}>
          {moduleSettings[0].useMapBox ? (
            <div>
              {/* <div id="rowContainer" className={lipasStyles.rowContainer}>{Filter}</div> */}
              <div>
                {/* <div className={lipasStyles.mapContainer} ref={mapContainer} /> */}
                {landscapeNotification == false ? (
                  <MapBoxMap></MapBoxMap>
                ) : (
                  <p style={{ marginTop: "70px", marginLeft: "10px" }}>
                    Käännä laite pystysuuntaan käyttääksesi karttaa
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div id="ListViewContainer">
              {loadListView(Object.keys(categories)[0])}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LipasAPI;
