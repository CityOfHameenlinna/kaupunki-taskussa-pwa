import React, { Component } from "react";
import CookieConsent, { getCookieConsentValue } from "react-cookie-consent";
import classes from "../css/App.module.scss";
import { sendPageviewIfConsent, setCookies } from "../helpers/GoogleAnalytics";
import InstallPWA from "./InstallPWA";
import Navbar from "./NavBar";

class App extends Component {
  componentDidMount() {
    document.title = "Kaupunki Taskussa - Etusivu";
    sendPageviewIfConsent(getCookieConsentValue());
  }

  render() {
    return (
      <>
        <Navbar />
        <header className={classes.AppHeader}>
          <div className={classes.AppHeaderImgContainer}>
            <div className={classes.AppHeaderImgFrontPage}>
              <div className={classes.Layer}></div>
            </div>
            <div className={classes.AppHeaderImgTitle}>
              <h1>Hämeenlinna</h1>
            </div>
          </div>

          <CookieConsent
            enableDeclineButton
            flipButtons
            buttonText="Salli evästeet"
            containerClasses={classes.CookieButton}
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
          className={[classes.AppContainer, "container"].join(" ")}
        >

          <main>
            <div className={classes.AppContent}>
              <h2 className={classes.AppTitle}>
                Hämeenlinna taskussa – ihan lähellä 24/7
              </h2>
              <p>
                Hämeenlinna taskussa –sovelluksen uusi versio tarjoaa sinulle
                oikotien kaupungin ajankohtaisiin tapahtumiin, uutisiin ja
                suosittuihin palveluihin. Kaupunki ja sen palvelut ovat
                kirjaimellisesti taskussasi.
              </p>
              <p>
                Suomen vanhin sisämaakaupunki Hämeenlinna perustettiin 1639. Sen
                maamerkki, Hämeen vanha linna on vartioinut Vanajaveden rantoja
                jo paljon sitä ennen ja vartioi edelleen.
              </p>
              <p>
                Keskellä eteläistä Suomea ja Suomen kasvukäytävää sijaitseva
                Hämeenlinna on helposti saavutettava kaupunki valtakunnan
                pääväylien risteyksessä. Runsaan tunnin matkan päässä
                sijaitsevat Suomen suurimmat kaupungit, lentokentät ja satamat.
              </p>
              <p>
                Hämeenlinna on kaupunki, jossa luonto ja vesi ovat kaikkialla
                läsnä. Meillä sinun ei tarvitse valita kaupungin palveluiden tai
                maaseudun rauhan välillä – voit ottaa molemmat.
              </p>
              <p>
                Hämeenlinna taskussa –sovelluksen kautta sympaattinen
                Hämeenlinna on ihan lähellä.
              </p>
              <div className={classes.InstallPWA}>
                <InstallPWA />
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }
}

export default App;
