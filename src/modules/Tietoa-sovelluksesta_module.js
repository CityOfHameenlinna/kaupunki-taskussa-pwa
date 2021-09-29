import React, { Component } from "react";
import CookieConsent, { getCookieConsentValue } from "react-cookie-consent";
import mainStyles from "../css/App.module.scss";
import { sendPageviewIfConsent, setCookies } from "../helpers/GoogleAnalytics";
import Navbar from "../js/NavBar";

class Tietoa extends Component {
  componentDidMount() {
    document.title = "Tietoa sovelluksesta";

    sendPageviewIfConsent(getCookieConsentValue());
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
              <h1>Tietoa Sovelluksesta</h1>
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
              <h2>Hämeenlinna taskussa – tietoa sovelluksesta</h2>
              <p>
                Hämeenlinna taskussa –sovelluksen uusi versio tarjoaa sinulle
                oikotien kaupungin ajankohtaisiin tapahtumiin, uutisiin ja
                suosittuihin palveluihin. Kaupunki ja sen palvelut ovat
                kirjaimellisesti taskussasi.
              </p>
              <p>
                Uudessa versiossa on säilytetty vanhat tutut toiminnot, kuten
                sähköinen kirjastokortti ja ajankohtaiset tiedotteet ja
                tapahtumat. Mutta paljon on tullut ja tulee uutta. Sähköisen
                kirjastokortin osalta tutkitaan lainojen uusimismahdollisuutta,
                lisätään linkit reittioppaaseen ja bussiliikenteen
                mobiililippuun sekä kaupungin sähköiseen asiointiin.
              </p>
              <p>
                Sovelluksen kautta tarjotaan jatkossa kootusti tietoa lähiseudun
                luontopoluista ja –kohteista, ulkoilureiteistä,
                kulttuurikohteista ja muista nähtävyyksistä. Ja arvonta mukavine
                palkintoineen aina silloin tällöin on myös luvassa.
              </p>
              <p>
                Uusi Hämeenlinna taskussa -versio toimii sekä Android- että
                iOS-laitteissa.
              </p>
              <p>
                Käyttäjien palaute on sovelluksen kehittämisessä hyvin tärkeää.
                Ideasi, toiveesi, kiitokset ja risut voit jättää sovellusvalikon
                kohdasta Palautetta sovelluksesta.
              </p>
              <h2>Sivuston käyttöehdot</h2>
              <h3>Tietosuoja</h3>
              <p>
                Kaupunki Taskussa-sovelluksessa kerätään anonyymejä
                käyttäjätietoja palvelujen parantamiseksi. Sivuilla käytetään
                ns. cookie-toimintoa eli evästeitä. Eväste (cookies) on pieni,
                käyttäjän omalle tietokoneelle lähetettävä ja siellä
                säilytettävä tekstitiedosto. Evästeet eivät vahingoita
                käyttäjien tietokoneita tai tiedostoja. Evästeet on mahdollista
                ottaa pois käytöstä. Poistaminen tapahtuu selaimen asetuksista.
                On hyvä huomioida, että evästeet voivat olla tarpeellisia
                joidenkin ylläpitämiemme sivujen ja tarjoamiemme palveluiden
                toiminnalle.
              </p>
              <h3>Google Analytics</h3>
              <p>
                Analysoimme sivustojemme kävijämääriä käyttämällä Google
                Analytics-työkalua. Kyseessä on Googlen tarjoama
                analytiikkapalvelu, joka toimii evästeillä. Googlen sijoittamiin
                evästeisiin sovelletaan Googlen omia ehtoja ja käytäntöjä, jotka
                löytyvät osoitteesta:{" "}
                <a href="https://policies.google.com/?hl=fi">
                  https://policies.google.com/?hl=fi
                </a>{" "}
                Google Analyticsin käyttämiä evästetietoja hyödynnetään
                palveluiden parantamiseen analysoimalla saatua dataa. Tämän
                anonyymin datan käsittelijöinä toimivat kaupungin ict- ja
                viestintäyksiköstä nimetyt henkilöt.
              </p>
              <h2>Datalähteet</h2>
              <h3>Häme Events</h3>
              <p>
                Tapahtumatiedot haetaan Kanta-Hämeen tapahtumarajapinnasta, <a href="https://www.hameevents.fi/">Häme Eventsistä</a>, 
                sen tarjoaman avoimen <a href="https://api.hameevents.fi/v1/">REST-rajapinnan</a> kautta. 
                Näytettävät tapahtumat on rajattu Hämeenlinna alueelle.
              </p>
              <h3>Hämeenlinnan kaupungin RSS-syöte</h3>
              <p>
                Hämeenlinnan kaupungin verkkosivujen RSS-syötteen kautta näytetään sovelluksessa olevat tiedotteet. 
                Näytettäviin tietoihin sisältyy tiedotteet ja häiriötiedotteet.
              </p>
              <h3>Kirjastokortti</h3>
              <p>
                Kirjastokortti toiminto on rakennettu Vanamo kirjastot-järjestelmien pohjalta.
              </p>
              <h3>LIPAS</h3>
              <p>
                Ulkoilu- ja liikuntapaikkojen tiedot haetaan <a href="https://lipas.fi">Lipas.fi</a> palvelun <a href="http://lipas.cc.jyu.fi/api/index.html">REST-rajapinnan</a> kautta.
                Lipas.fi on valtakunnallinen ja julkinen liikunnan paikkatietojärjestelmä,
                jota hallinnoi Jyväskylän yliopiston liikuntatieteellinen tiedekunta ja rahoittaa opetus- ja kulttuuriministeriö.
                Tietosisältöä ylläpitävät liikuntapaikkojen vastuuhenkilöt kunnissa,
                virkistysalueyhdistykset sekä muut liikuntapaikkojen omistajat.
                Lipas-projektitiimi huolehtii tietojen yhtenäisyydestä ja kattavuudesta valtakunnallisesti.
              </p>
            </div>
          </main>
        </div>
      </>
    );
  }
}

export default Tietoa;
