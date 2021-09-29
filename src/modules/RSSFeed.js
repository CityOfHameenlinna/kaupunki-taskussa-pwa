import React, { Component } from "react";
import CookieConsent, { getCookieConsentValue } from "react-cookie-consent";
import { Preloader } from "react-materialize";
import * as rssParser from "react-native-rss-parser";
import { db } from "../../dexieDB";
import rssFeedSettings from "../../settings.json";
import mainStyles from "../css/App.module.scss";
import rssStyles from "../css/rss/Rss.module.scss";
import { sendPageviewIfConsent, setCookies } from "../helpers/GoogleAnalytics";
import Navbar from "../js/NavBar";
import PopUp from "../js/PopUpComponent";
import FeedSelectBar from "../RSS/FeedSelectBar";
import RssFeedsList from "../RSS/RssFeedsList";
import ShowAllButton from "../UI/Button";

class Tiedotteet_module extends Component {
  _isMounted = false;

  //Fetch RSS FEED settings from settings.json file
  rssModuleSettings = (rssFeedSettings) => {
    let settings = [];
    //This path has to bee same as settings.json rssfeed module name.
    const path = "RSSFeed";
    //Fetching right settings for rss feed by path name
    settings.push(rssFeedSettings.settings.find((x) => x.name == path));
    return settings;
  };

  constructor() {
    super();
    //fetch RSS settings from config file
    let settings = this.rssModuleSettings(rssFeedSettings);
    this.state = {
      isLoading: true,
      isLoadingNew: false,
      feedObject: null,
      combinedFeedObjects: null,
      settings: settings[0],
      combineFeeds: settings[0].combineFeeds,
      feedUrls: settings[0].feedUrls,
      failedToFetch: false,
      currentlyOpenFeedId: "",
      btnShowMoreLink: "",
      btnShowMoreText: "",
      showBtnShowMore: false,
      feedPageTitle: "",
    };
    this.handleSelect = this.handleSelect.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
    //Fetch default url or all combined urls
    let settings = this.rssModuleSettings(rssFeedSettings);
    if (this.state.combineFeeds) {
      let pageTitle = settings[0].pageTitle;
      this.setState({
        feedPageTitle: pageTitle
      })
      document.title = pageTitle;
      this.fetchRssData();
    } else {
      let firstUrlName = settings[0].feedUrls[0].name;
      let firstId = settings[0].feedUrls[0].id;
      let pageTitle = settings[0].pageTitle;
      this.setState({
        currentlyOpenFeedId: firstId,
        feedPageTitle: pageTitle
      })
      this.handleSelect(firstUrlName, firstId);
    }
    setTimeout(() => {
      if (this.state.failedToFetch) {
        this.getAndSetDataFromDb(true);
      }
      if (this.state.feedObject == null) {
        this.setState({ failedToFetch: true, isLoading: false });
      }
    }, 10000);
    sendPageviewIfConsent(getCookieConsentValue());
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  //Handle what url has been selected on tab list
  handleSelect = (urlName, itemId) => {
    //Set icon back to normal >
    try {
      document.getElementById(this.state.currentlyOpenFeedId).innerHTML =
        "chevron_right";
    } catch (error) {
      //"Cant find element
      console.log(error);
    }
    try {

      let feedUlr = this.state.settings.feedUrls.find((x) => x.id == itemId);
      let urlProxy = feedUlr.proxy + feedUlr.url;
      if (this._isMounted == true) {
        this.setState({
          btnShowMoreLink: this.state.settings[urlProxy].showMoreLink.href,
          btnShowMoreText: this.state.settings[urlProxy].showMoreLink.name,
          showBtnShowMore: this.state.settings[urlProxy].showMoreLink.isShowing,
          feedPageTitle: this.state.settings.pageTitle,
        });
      }


    } catch (error) {
      //Cant find element
      console.log(error);
    }
    try {
      if (this._isMounted == true) {
        this.setState({
          isLoading: true,
          currentlyOpenFeedId: itemId
        });
      }
    } catch (error) {
      console.log(error);
    }

    try {
      //Set selected tab icon to arrow down
      document.getElementById(itemId).innerHTML = "expand_more";
    } catch (error) {
      console.log(error);
    }

    let newUrls = [...this.state.feedUrls];
    newUrls.map((url) => {
      if (urlName === url.name) {
        this.fetchFeed(url.proxy + url.url);
      }
    });
  };
  //Fetch specific url
  fetchFeed(url) {
    fetch(url)
      .then((response) => response.text())
      .then((responseData) => rssParser.parse(responseData))
      .then((rss) => {
        rss["settingsName"] = url;
        if (this._isMounted == true) {
          this.setState({
            feedObject: rss,
            isLoading: false
          });
        }
        this.setDataToDb(this.state);
      })
      .catch((error) => {
        console.error("FETCH ERROR OCCURRED!");
        console.error(error);
        this.getAndSetDataFromDb(true);
      });
  }
  //fetch all feed urls from settings.json
  fetchRssData = () => {
    let dataList = [];
    if (this._isMounted == true) {
      this.setState({
        isLoading: true,
      });
    }
    let newUrls = [...this.state.feedUrls];
    newUrls.forEach((item, index) => {
      fetch(item.proxy + item.url)
        .then((response) => response.text())
        .then((responseData) => rssParser.parse(responseData))
        .then((rss) => {
          rss["settingsName"] = item.proxy + item.url;
          let urlProxy = item.proxy + item.url;
          dataList.push(rss);
          if (this._isMounted == true) {
            this.setState({
              isLoading: false,
              feedObject: dataList,
              btnShowMoreLink: this.state.settings[urlProxy].showMoreLink.href,
              btnShowMoreText: this.state.settings[urlProxy].showMoreLink.name,
              showBtnShowMore: this.state.settings[urlProxy].showMoreLink
                .isShowing,
              feedPageTitle: this.state.settings.pageTitle,
            });
          }
          this.setDataToDb(this.state);

        })
        .catch((error) => {
          this.getAndSetDataFromDb(true);
          console.error("FETCH ERROR OCCURRED!");
          console.error(error);
        });
    });

  };
  setDataToDb = (data) => {
    try {
      db.feeds.put({ id: 1, data: data });
    } catch (error) {
      console.error("FAILED TO PUT RSS FEED DB:");
      console.error(error);
    }
  }
  getAndSetDataFromDb = (isError) => {
    try {
      db.feeds.get(1).then((items) => {

        if (isError) {
          items.data.failedToFetch = true;
        }
        if (this._isMounted == true) {
          this.setState(items.data);
        }
      });
    } catch (error) {
      console.error("FAILED TO LOAD RSS FEED DB:");
      console.error(error);
      if (this._isMounted == true) {
        this.setState({ failedToFetch: true });
      }
    }


  }
  render() {
    const {
      isLoading,
      feedObject,
      feedUrls,
      combineFeeds,
      settings,
      failedToFetch,
      btnShowMoreLink,
      btnShowMoreText,
      showBtnShowMore,
      feedPageTitle,
    } = this.state;
    return (
      <>
        <header className={mainStyles.AppHeader}>
          <Navbar />
          <div className={mainStyles.AppHeaderImgContainer}>
            <div className={mainStyles.AppHeaderImgNews}>
              <div className={mainStyles.Layer}></div>
            </div>
            <div className={mainStyles.AppHeaderImgTitle}>
              <h1>{feedPageTitle}</h1>
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
        <div id="App-container" className={mainStyles.AppContainer}>
          <main>
            {/*if combineFeed parameter is false generate FeedSelectBar*/}
            {!combineFeeds ? (
              <FeedSelectBar
                feedUrls={feedUrls}
                handleSelect={this.handleSelect}
              ></FeedSelectBar>
            ) : (
              null
            )}
            {!isLoading ? (

              <div>
                {/* List rss feeds */}
                <RssFeedsList
                  data={feedObject}
                  rssSettings={settings}
                  combine={combineFeeds}
                />
                {/* Add show all button, btn will redirect to external page*/}
                {showBtnShowMore ? (
                  <div className={rssStyles.btnShowMore}>
                    <ShowAllButton>
                      <a href={btnShowMoreLink}>{btnShowMoreText}</a>
                    </ShowAllButton>
                  </div>
                ) : (
                  null
                )}
                {failedToFetch ? (<PopUp title={"Hups! Jotain meni vikaan."} content={"Uusimpia tiedotteita ei voitu hakea, tarkista laitteen pääsy Internetiin."} iconStyle={"portable_wifi_off"} buttonText={"OK"}></PopUp>) : null}
              </div>
            ) : (
              // If there is a delay in data, let's let the user know it's loading
              <div className={rssStyles.LoadingContent}>
                <Preloader
                  active
                  flashing={false}
                  size="big"
                  className={rssStyles.HML}
                />
              </div>
            )}
          </main>
        </div>
      </>
    );
  }
}
export default Tiedotteet_module;
