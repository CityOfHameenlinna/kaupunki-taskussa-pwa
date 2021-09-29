import React, { Component } from "react";
import CookieConsent, { getCookieConsentValue } from "react-cookie-consent";
import { Preloader,Icon,Col } from "react-materialize";
import mainStyles from "../css/App.module.scss";
import lipasStyles from "../css/LipasAPI/LipasAPI.module.scss";
import { sendPageviewIfConsent, setCookies } from "../helpers/GoogleAnalytics";
import LocationList from "../LipasAPI/LocationList";
import settings from "../../settings.json";

class LipasAPIList extends Component {

   //Fetch Lipas settings from settings.json file
   lipasSettings = (settings) => {
    let lipasSettings = [];
    //This path has to bee same as settings.json rssfeed module name.
    const path = "LipasAPI";
    //Fetching right settings for rss feed by path name
    lipasSettings.push(settings.settings.find((x) => x.name == path));
    return lipasSettings;
  };

  _isMounted = false;

  constructor() {
    super();
    this.state = {
      pageName: "Kohteet",
      locations: null,
      isLoading: true,
      noDataMsg:"Paikasta ei ole tietoa saatavilla"
    };
  }

  componentDidMount() {
    this._isMounted = true;
    const pageName = this.props.categoryName;
    let formattedName = pageName.replace(/-/g, " ")
    if (this._isMounted == true) {
      this.setState({ pageName: formattedName})
    }
    sendPageviewIfConsent(getCookieConsentValue());
    this.fetchLocations(formattedName)
  }

  componentWillUnmount() {
    this._isMounted = false;
  }
  fetchLocations = (page) => {
    let urlToFetch = null;
    this.setState({isLoading:true});
    let lipasSettings = this.lipasSettings(settings);
    let categories = lipasSettings[0].settings.categories;
    let dataNotAvailableMsg = lipasSettings[0].popUpDataNotAvailable;
    let currentPageObj;
    Object.entries(categories).map((item,index)=>{
      if(Object.values(item)[0] === page)
      {
        currentPageObj = item;
      }
    })
    let queryString ="?CityCodes:"+lipasSettings[0].settings.cityCodes[0];
    let typeCodesList = currentPageObj[1].typeCodes;
    typeCodesList.forEach((item,index)=>
    {
      queryString = queryString+ "&typeCodes="+item;
    });
    urlToFetch = lipasSettings[0].requestUrl + queryString;
    fetch(urlToFetch)
      .then((response) => response.json())
      .then((resp) => {
        this.fetchDetails(resp,page,dataNotAvailableMsg)
      })
  }

  fetchDetails = (idArray,pageName,dataNotAvailableMsg) => {
    let lipasSettings = this.lipasSettings(settings);
    const lipasBaseUrl = lipasSettings[0].requestUrl;
    let resultsArray = [];
    let itemsFetched = 0;
    idArray.forEach(element => {
      fetch(lipasBaseUrl + "/" + element.sportsPlaceId)
        .then((details) => details.json())
        .then((detailsObj) => {
          resultsArray.push(detailsObj)
          itemsFetched++;
          if (itemsFetched == idArray.length) {
            if (this._isMounted == true) {
              let sortedList = resultsArray.sort(function(a, b) {
                return a === b ? 0 : a < b ? -1 : 1;
              });
              this.setState({ locations: sortedList, isLoading: false,pageName:pageName,noDataMsg:dataNotAvailableMsg})
            }
          }
        })
    });
  }
  addCategoryButtons=()=>{
    let lipasSettings = this.lipasSettings(settings);
    let categories = lipasSettings[0].settings.categories;
    let buttonsList = [];
    Object.keys(categories).map((item,index)=>{ 
   
      buttonsList.push(<Col key={"catBtn"+index} xs={3} className={lipasStyles.colit}><button className={lipasStyles.button} onClick={() =>this.fetchLocations(Object.keys(categories)[index])}>
      <Icon
        key={index + "icon"}
        small
        className={lipasStyles.ActivityColor}
      >
      {Object.entries(categories)[index][1].icon}
    </Icon>
    <br />
    <p>{Object.keys(categories)[index]}</p></button></Col>)
    });
    return <div className="container"><div className="row">{buttonsList}</div></div>;
  }
  
  render() {
    return (
      <>

          <div className={mainStyles.AppHeaderImgContainer}>
            <div className={mainStyles.AppHeaderImgAbout}>
              <div className={mainStyles.Layer}></div>
            </div>
            <div className={mainStyles.AppHeaderImgTitle}>
              <h1 className={lipasStyles.Capitalize}>{this.state.pageName}</h1>
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

        <div
          id="App-container"
          className={[mainStyles.AppContainer, "container"].join(" ")}
        >
            <div className={lipasStyles.MainContent}>
            <div id="categoryBtnContainer">
            {this.addCategoryButtons()}
            </div>
              {!this.state.isLoading ? (<LocationList locations={this.state.locations} noDataMsg={this.props.noDataMsg} />)
                :
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
        </div>
      </>
    );
  }
}

export default LipasAPIList;
