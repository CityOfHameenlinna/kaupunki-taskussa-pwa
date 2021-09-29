import React, { useEffect, useState } from "react";
import CookieConsent, { getCookieConsentValue } from "react-cookie-consent";
import { Preloader, Icon } from "react-materialize";
import { useParams } from "react-router-dom";
import mainStyles from "../css/App.module.scss";
import lipasStyles from "../css/LipasAPI/LipasAPI.module.scss";
import { sendPageviewIfConsent, setCookies } from "../helpers/GoogleAnalytics";
import Navbar from "../js/NavBar";

const locationDetails = () => {
    //Fetch Lipas settings from settings.json file
   lipasSettings = (settings) => {
    let lipasSettings = [];
    //This path has to bee same as settings.json rssfeed module name.
    const path = "LipasAPI";
    //Fetching right settings for rss feed by path name
    lipasSettings.push(settings.settings.find((x) => x.name == path));
    return lipasSettings;
  };
  let lipasSettings = this.lipasSettings(settings);

    const [location, setLocation] = useState(null);
    const [isLoading, setLoading] = useState(true)

    const { id } = useParams();

    useEffect(() => {
        document.title = "Paikan tiedot"
        sendPageviewIfConsent(getCookieConsentValue());
        console.log(id)
        fetchDetails(id)
    }, [])

    const fetchDetails = () => {
        const lipasBaseUrl = lipasSettings[0].settings.requestUrl;

        fetch(lipasBaseUrl + "/" + id)
            .then((details) => details.json())
            .then((detailsObj) => {
                setLocation(detailsObj)
                setLoading(false)
            })
    }

    const getUrlForLocation = () => {
        let url = null;

        if (location.location.coordinates) {
            if (location.location.coordinates.wgs84) {
                url = `https://www.google.com/maps/search/?api=1&query=${location.location.coordinates.wgs84.lat},${location.location.coordinates.wgs84.lon}`;
            }
        }
        return url
    }

    const formatPlaceName = (name) => {
        let placeNameFormatted = name.toLowerCase().replace(/ /g, "+")
        return placeNameFormatted;
    }

    return (
        <>
            <header className={mainStyles.AppHeader}>
                <Navbar />
                <div className={mainStyles.AppHeaderImgContainer}>
                    <div className={mainStyles.AppHeaderImgAbout}>
                        <div className={mainStyles.Layer}></div>
                    </div>
                    <div className={mainStyles.AppHeaderImgTitle}>
                        {location != null && <h1>{location.name}</h1>}
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
                    <div className={lipasStyles.MainContent}>
                        {!isLoading ?
                            (location != null && (
                                <article>
                                    <h2>{location.name}</h2>
                                    <br />
                                    <p>
                                        {location.properties && location.properties.infoFi ? (location.properties.infoFi) : ("Paikalle ei ole annettu kuvausta")}
                                    </p>
                                    <p>
                                        {getUrlForLocation() != null && <a href={getUrlForLocation()} target="_blank" ><Icon tiny>location_on</Icon> {location.location.address}</a>}
                                        {location.location.address == null && "Paikalle ei ole annettu osoitetta"}
                                    </p>
                                    {location.www != null &&
                                        <p>
                                            <a target="_blank" href={`${location.www}`}><Icon tiny>link</Icon> www</a>
                                        </p>
                                    }
                                    {getUrlForLocation() == null && !location.www &&
                                        <p>
                                            <a target="_blank" href={`https://www.google.fi/search?q=${formatPlaceName(location.name)}`}><Icon tiny>link</Icon> Hae nimellä lisätietoa Googlella tästä.</a>
                                        </p>
                                    }
                                </article>)) :
                            (<div className={lipasStyles.LoadingContent}>
                                <Preloader
                                    active
                                    flashing={false}
                                    size="big"
                                    className={lipasStyles.HML}
                                    key={"loaderKey"}
                                />
                            </div>)
                        }
                    </div>
                </main>
            </div>
        </>
    )
}

export default locationDetails
