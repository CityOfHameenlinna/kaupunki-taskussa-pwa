import React, { Component } from "react";
import { getCookieConsentValue } from "react-cookie-consent";
import { browserVersion, isAndroid, isFirefox, isIOS, isMobile, isOpera } from "react-device-detect";
import { Icon } from "react-materialize";
import styles from "../css/App.module.scss";
import Button from "../UI/Button";

const platforms = {
  NATIVE: "native", // currently: Chrome, Edge mobile, Samsung internet
  FIREFOX: "firefox",
  FIREFOX_NEW: "firefox_new", // above version 79
  OPERA: "opera",
  IDEVICE: "idevice",
  OTHER: "other", // don't know, so will do nothing
};

class InstallPWA extends Component {
  state = {
    name: window.location.pathname,
    platform: platforms.OTHER,
    installed: false,
    supported: false,
    supportedManual: false,
    promptInstall: null,
  };

  onClick = (evt) => {
    evt.preventDefault();
    if (!this.state.promptInstall) {
      return;
    }
    if (getCookieConsentValue() == true) {
      window.gtag("event", "automatic_install_prompt_shown", {
        event_category: "App Install",
        event_label: "Install prompt shown to user",
      });
    }
    this.state.promptInstall.prompt();
    this.setState({ promptInstall: null });
  };

  componentDidMount() {
    let isInstalled = false;
    let platformValue = platforms.OTHER;
    let isSupported = false;
    let isSupportedManual = false;

    let event = null;

    if (
      window.navigator.standalone === true ||
      window.matchMedia("(display-mode: standalone)").matches
    ) {

      window.addEventListener("DOMContentLoaded", (event) => {
        if (getCookieConsentValue() == true) {
          window.gtag("event", "started_as_PWA", {
            event_category: "App usage",
            event_label: "Started as PWA",
          });
        }
      });
      isInstalled = true;
      this.setState({ installed: true });
    }

    if (window.hasOwnProperty("BeforeInstallPromptEvent")) {
      platformValue = platforms.NATIVE;
    } else if (isMobile && isAndroid && isFirefox && +browserVersion >= 79) {
      platformValue = platforms.FIREFOX_NEW;
    } else if (isMobile && isAndroid && isFirefox) {
      platformValue = platforms.FIREFOX;
    } else if (isOpera && isAndroid && isMobile) {
      platformValue = platforms.OPERA;
    } else if (isIOS && isMobile) {
      platformValue = platforms.IDEVICE;
    } else {
      platformValue = platforms.OTHER;
    }
    if (platformValue === platforms.NATIVE) {
      isSupported = true;
    } else if (
      platformValue !== platforms.NATIVE &&
      platformValue !== platforms.OTHER
    ) {
      isSupportedManual = true;
      window.addEventListener("DOMContentLoaded", (event) => {
        if (getCookieConsentValue() == true) {
          window.gtag("event", "manual_install_prompt_shown", {
            event_category: "App Install",
            event_label: "Install prompt shown to user",
          });
        }
      });
    }
    this.setState({
      platform: platformValue,
      installed: isInstalled,
      supported: isSupported,
      supportedManual: isSupportedManual,
      //promptInstall: event,
    });
    //};

    // Initialize deferredPrompt for use later to show browser install prompt.
    let deferredPrompt;

    window.addEventListener("beforeinstallprompt", (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      deferredPrompt = e;
      //deferredPrompt.prompt()
      // Update UI notify the user they can install the PWA
      //showInstallPromotion();
      this.setState({ promptInstall: deferredPrompt });
      // Optionally, send analytics event that PWA install promo was shown.
      console.log(`'beforeinstallprompt' event was fired.`);
    });
    // window.addEventListener("beforeinstallprompt", handler);

    // return () => window.removeEventListener("transitionend", handler);
  }

  // Render content based on browser features set in componentDidUpdate
  renderContent() {
    if (!this.state.installed) {
      if (!this.state.supported && !this.state.supportedManual) {
        return null;
      } else if (this.state.supportedManual) {
        return (
          <>
            <p>
              Voit asentaa sovelluksen ainakin seuraavilla selaimilla:
              <br />
              Mobiili: <br />
              Android - Chrome
              <br />
              Android - Firefox
              <br />
              Android - Opera
              <br />
              Android - Samsung
              <br />
              iOS - Safari
              <br />
              <br />
              Työpöytä:
              <br />
              Chrome
              <br />
              Edge
              <br />
            </p>
            <p>
              Parhaan käyttökokemuksen saat iOS-laitteilla käyttämällä
              Safari-selainta ja Android-laitteilla Chrome-selainta
            </p>
            <p>
              Asenna sovellus näin:
              <br />
              <br />
              <ul>
                <li>
                  <p>
                    1. Avaa selaimesi asetusvalikko. Tämän löydät useimmissa
                    selaimissa osoitekentän vierestä.
                    {this.state.platform === platforms.IDEVICE && (
                      <p>
                        Paina Jaa-painiketta <Icon small>ios_share</Icon>
                      </p>
                    )}
                    {this.state.platform === platforms.FIREFOX && (
                      <p>
                        Paina osoitepalkissa olevaa painiketta{" "}
                        <Icon>add_to_home_screen</Icon>
                      </p>
                    )}
                    {this.state.platform === platforms.FIREFOX_NEW && (
                      <p>
                        Paina menu painiketta <Icon small>more_vert</Icon>
                      </p>
                    )}
                    {this.state.platform === platforms.OPERA && (
                      <p>
                        Paina menu painiketta <Icon small>more_vert</Icon>
                      </p>
                    )}
                  </p>
                </li>
                <li>
                  <p>
                    2. Selaimesta riippuen painettava kohta voi olla esimerkiksi
                    "Asenna", "Lisää työpöydälle", "Lisää kotinäyttöön" tai
                    "Aloitusnäyttö"
                  </p>
                </li>
                <li>
                  <p>
                    3. Jatkossa sovelluksen voit käynnistää suoraan laitteellesi
                    lisätystä kuvakkeesta.
                  </p>
                </li>
              </ul>
            </p>
          </>
        );
      } else if (this.state.supported && this.state.promptInstall) {
        console.log(this.state.supported);
        return (
          <>
            <div className={styles.SetupButton}>
              <Button
                id="setup_button"
                aria-label="Asenna sovellus"
                title="Asenna sovellus"
                clickHandler={this.onClick}
              >
                Asenna Kaupunki Taskussa
              </Button>
            </div>
          </>
        );
      } else {
        return null;
      }
    }
  }

  render() {
    return <>{this.renderContent()}</>;
  }
}

export default InstallPWA;
