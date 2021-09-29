import React, { Component } from "react";
import CookieConsent, { getCookieConsentValue } from "react-cookie-consent";
import { Preloader } from "react-materialize";
import mainStyles from "../css/App.module.scss";
import taskuraatiStyles from "../css/taskuraati/Taskuraati.module.scss";
import { sendPageviewIfConsent, setCookies } from "../helpers/GoogleAnalytics";
import Navbar from "../js/NavBar";
import settings from "../../settings.json";

class Taskuraati extends Component {
  _isMounted = false;
  state = {
    name: window.location.pathname,
    isLoading: true,
    surveyUrl: null,
  };

  //Fetch Lipas settings from settings.json file
  taskuraatiSettings = (settings) => {
    let taskuraatiSettings = [];
    //This path has to bee same as settings.json rssfeed module name.
    const path = "Taskuraati";
    //Fetching right settings for rss feed by path name
    taskuraatiSettings.push(settings.settings.find((x) => x.name == path));
    return taskuraatiSettings;
  };
  
  componentDidMount() {
    let taskuraatiSettings = this.taskuraatiSettings(settings);
    this._isMounted = true;
    document.title = "Taskuraati";

    let formsURL;
    let hasSurveyAvailable = false;

    //Tällä hetkellä ei ole käynnissä olevia Taskuraati-kyselyitä.

    fetch(taskuraatiSettings[0].proxyURL + taskuraatiSettings[0].surveyURL)
      .then((response) => response.text())
      .then((resp) => {
        //console.log("Text");
        //console.log(resp);
        //const regex = /forms.office.com\/Pages\/ResponsePage.aspx\?id=.+?(?=")/gm;
        const regex = /forms.office.com\/Pages\/ResponsePage.aspx\?id=.+?(?=")/gm;
        const regex2 = /forms.office.com\/r\/.+?(?=")/gm;
        let results;

        // Test string

        while ((results = regex.exec(resp)) !== null) {
          // This is necessary to avoid infinite loops with zero-width matches
          if (results.index === regex.lastIndex) {
            regex.lastIndex++;
          }

          if (results != null) {
            formsURL = results[0]
            hasSurveyAvailable = true
          }
        }

        if (hasSurveyAvailable == false) {
          while ((results = regex2.exec(resp)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (results.index === regex.lastIndex) {
              regex.lastIndex++;
            }

            if (results != null) {
              formsURL = results[0]
              hasSurveyAvailable = true
            }
          }
        }

        if (this._isMounted == true) {
          if (hasSurveyAvailable == false) {
            this.setState({ hasSurvey: false, isLoading: false });
          } else {
            this.setState({ surveyUrl: "https://" + formsURL, hasSurvey: true, isLoading: false });
          }
        }
      });

    sendPageviewIfConsent(getCookieConsentValue());
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    return (
      <>
        <header className={mainStyles.AppHeader}>
          <Navbar />
          <div className={mainStyles.AppHeaderImgContainer}>
            <div className={mainStyles.AppHeaderImgAbout}>
              <div className={mainStyles.Layer}></div>
            </div>
            <div className={mainStyles.AppHeaderImgTitle}>
              <h1>Taskuraati</h1>
            </div>
          </div>
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
            Käytämme sivustolla evästeitä. Sallimalla evästeet keräämme
            anonyymejä käyttötilastoja.
          </CookieConsent>
        </header>
        <div
          id="App-container"
          className={[mainStyles.AppContainer, "container"].join(" ")}
        >
          <main>
            <div className={mainStyles.AppContent}>
              {!this.state.isLoading ? (
                this.state.hasSurvey ? (
                  <iframe
                    //width="100vw"
                    //height="100vh"
                    frameBorder="0"
                    vertical-align="top"
                    src={this.state.surveyUrl}
                    className={taskuraatiStyles.Forms}
                  ></iframe>
                ) : (
                  <p>
                    Tällä hetkellä ei ole käynnissä olevia Taskuraati-kyselyitä.
                  </p>
                )
              ) : (<div className={taskuraatiStyles.LoadingContent}>
                <Preloader
                  active
                  flashing={false}
                  size="big"
                  className={taskuraatiStyles.HML}
                />
              </div>)}
            </div>
          </main>
        </div>
      </>
    );
  }
}

export default Taskuraati;