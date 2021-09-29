import React, { Component } from "react";
import CookieConsent, { getCookieConsentValue } from "react-cookie-consent";
import { Preloader, Tab, Tabs } from "react-materialize";
import { db } from "../../dexieDB";
import eventsSettings from "../../settings.json";
import mainStyles from "../css/App.module.scss";
import eventsStyles from "../css/events/Events.module.scss";
import DateFilter from "../Events/DateFilter";
import EventList from "../Events/EventList";
import FilterBar from "../Events/FilterBar";
import KeywordFilter from "../Events/KeywordFilter";
import LocationFilter from "../Events/LocationFilter";
import TextFilter from "../Events/TextFilter";
import { filterEventsForToday, sortEventsByDay } from "../Events/utilities";
import { sendPageviewIfConsent, setCookies } from "../helpers/GoogleAnalytics";
import Navbar from "../js/NavBar";
import PopUp from "../js/PopUpComponent";
import EventButton from "../UI/Button";

class Tapahtumat_module extends Component {
  _isMounted = false;

  // Fetch Events settings from settings.json file
  eventsModuleSettings = (eventsSettings) => {
    let settings = [];
    // This path has to bee same as settings.json events module name.
    const path = "LinkedEvents";
    // Fetching right settings for events by path name
    settings.push(eventsSettings.settings.find((x) => x.name == path));
    return settings;
  };

  constructor() {
    super();

    // Fetch Events settings from config file
    let settings = this.eventsModuleSettings(eventsSettings);

    // Update the keywords and locations values based on your API and enabled search filters
    // Keywords values keys: id, name -> displayed on page, value -> searched with, checked: false
    // Locations values keys: id, name -> displayed on page, value -> searched with, checked: false

    this.state = {
      settings: settings[0],
      isLoading: true,
      isLoadingNew: false,
      keywords: [
        {
          id: "keyword-1",
          name: "Musiikki",
          value: "yso:p1808",
          checked: false,
        },
        {
          id: "keyword-2",
          name: "Urheilu",
          value: "yso:p965,yso:p916",
          checked: false,
        },
        {
          id: "keyword-3",
          name: "Teatteri, viihde",
          value:
            "yso:p16327,yso:p1235,yso:p1278,yso:p27351,yso:p9237,yso:p2625",
          checked: false,
        },
        {
          id: "keyword-4",
          name: "Messut, markkinat",
          value: "yso:p4892,yso:p24062",
          checked: false,
        },
        {
          id: "keyword-5",
          name: "Museot, galleriat",
          value: "yso:p4934",
          checked: false,
        },
        {
          id: "keyword-6",
          name: "Näyttelyt",
          value: "yso:p5121",
          checked: false,
        },
        {
          id: "keyword-7",
          name: "Paikallisille",
          value: "yso:p1393,yso:p2434,yso:p8113,yso:p19248,yso:p15875,yso:p916",
          checked: false,
        },
        {
          id: "keyword-8",
          name: "Lapset, perheet",
          value: "yso:p4354,yso:p13050,yso:p4363",
          checked: false,
        },
        {
          id: "keyword-9",
          name: "Yrityksille",
          value: "yso:p3128",
          checked: false,
        },
      ],
      locations: [
        {
          id: "location-1",
          name: "Hauho",
          value: "14700,14680,14690,14770,14930",
          checked: false,
        },
        {
          id: "location-2",
          name: "Hämeenlinna",
          value:
            "13100,13110,13130,13200,13210,13220,13250,13270,13300,13430,13500,13600",
          checked: false,
        },
        {
          id: "location-3",
          name: "Kalvola",
          value: "14500,14450,14530",
          checked: false,
        },
        {
          id: "location-4",
          name: "Lammi",
          value: "12170,16900,16960,16970",
          checked: false,
        },
        { id: "location-5", name: "Renko", value: "14300", checked: false },
        {
          id: "location-6",
          name: "Tuulos",
          value: "14810,14820,14840,14870",
          checked: false,
        },
      ],
      query: "",
      hasNextPage: "",
      errorMsg: null,
      startDate: null,
      endDate: null,
    };
  }

  componentDidMount() {
    this._isMounted = true;
    document.title = "Tapahtumat";

    sendPageviewIfConsent(getCookieConsentValue());

    // If address_locality search is supported
    if (this.state.settings.filters.includeAddressLocality === true) {
      // Get events without filters
      this.filterEvents(
        this.state.settings.apiURL +
        `?include=location&address_locality_fi=${this.state.settings.filters.locality}&sort=start_time&start=today&page_size=${this.state.settings.showEventsCount}`
      );
    } else {
      // Get events without filters
      this.filterEvents(
        this.state.settings.apiURL +
        `?include=location&sort=start_time&start=today&page_size=${this.state.settings.showEventsCount}`
      );
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  // Handler for setting the checked state of a keyword
  handleKeywordSelect = (event) => {
    let newKeywords = [...this.state.keywords];

    newKeywords.map((keyword) => {
      if (event === keyword.id) {
        keyword.checked = !keyword.checked;
      }
    });
    if (this._isMounted) {
      this.setState({ keywords: newKeywords });
    }
  };

  // Handler for setting the checked state of a location
  handleLocationSelect = (event) => {
    let newLocations = [...this.state.locations];

    newLocations.map((location) => {
      if (event === location.id) {
        location.checked = !location.checked;
      }
    });
    if (this._isMounted) {
      this.setState({ locations: newLocations });
    }
  };

  // Handler for setting the state of the text query
  handleQuery = (event) => {
    if (this._isMounted) {
      this.setState({ query: event.target.value });
    }
  };

  // Handler for setting the state of the start date query
  handleStart = (date) => {
    //this.setState({ startDate: this.dateToString(date) });
    if (this._isMounted) {
      this.setState({ startDate: date });
    }
  };

  // Handler for setting the state of the end date query
  handleEnd = (date) => {
    //this.setState({ endDate: this.dateToString(date) });
    if (this._isMounted) {
      this.setState({ endDate: date });
    }
  };

  // Handler for starting the next results search
  getNextHandler = () => {
    const url = this.state.hasNextPage;
    this.filterEvents(url);
  };

  // Return a native JavaScript date
  toNativeDate = (date) => {
    return new Date(date.year, date.month - 1, date.day);
  };

  dateToString = (date) => {
    if (date) {
      const offset = date.getTimezoneOffset();
      date = new Date(date.getTime() - offset * 60 * 1000);
      return date.toISOString().split("T")[0];
    } else {
      return null;
    }
  };

  // Get the filters to use from state
  getFilters = () => {
    let parameters = [];

    if (this.state.query.length > 0) {
      const text = "text=" + this.state.query;
      parameters.push(text);
    }

    let keywords = [];
    let allKeywords = [...this.state.keywords];
    allKeywords.map((keyword) => {
      if (keyword.checked == true) {
        keywords.push(keyword.value);
      }
    });

    if (keywords.length > 0) {
      const searchKw = "keyword=" + keywords.join(",");
      parameters.push(searchKw);
    }

    let locations = [];
    let allLocations = [...this.state.locations];
    allLocations.map((location) => {
      if (location.checked == true) {
        locations.push(location.value);
      }
    });

    if (locations.length > 0) {
      const searchLocation = "postal_code=" + locations.join(",");
      parameters.push(searchLocation);
    }

    // convert startDate to JS native date format and then to string for query parameters
    if (this.state.startDate) {
      const startNative = this.toNativeDate(this.state.startDate);
      const start = "start=" + this.dateToString(startNative);
      parameters.push(start);
    }

    // convert endDate to JS native date format and then to string for query parameters
    if (this.state.endDate) {
      const endNative = this.toNativeDate(this.state.endDate);
      const end = "end=" + this.dateToString(endNative);
      parameters.push(end);
    }

    let url = null;

    if (this.state.settings.filters.includeAddressLocality === true) {
      url =
        this.state.settings.apiURL +
        `?include=location&address_locality_fi=${this.state.settings.filters.locality}&sort=start_time&start=today&page_size=${this.state.settings.showEventsCount}&` +
        parameters.join("&");
    } else {
      url =
        this.state.settings.apiURL +
        `?include=location&sort=start_time&start=today&page_size=${this.state.settings.showEventsCount}&` +
        parameters.join("&");
    }

    this.filterEvents(url);

    // Close collapsible search bar
    var elem = document.getElementsByClassName("collapsible");
    var colla = elem[0]["M_Collapsible"];
    var instance = M.Collapsible.getInstance(colla.el);
    instance.close();
  };

  // Clear the used filters
  clearFilters = () => {
    const queryClear = "";
    const startDateClear = null;
    const endDateClear = null;

    let allKeywordsClear = [...this.state.keywords];
    allKeywordsClear.map((keyword) => {
      keyword.checked = false;
    });

    let allLocationsClear = [...this.state.locations];
    allLocationsClear.map((location) => {
      location.checked = false;
    });

    if (this._isMounted) {
      this.setState({
        query: queryClear,
        startDate: startDateClear,
        endDate: endDateClear,
        keywords: allKeywordsClear,
        locations: allLocationsClear,
      });
    }
  };

  // Filter events with the received url
  filterEvents = (url) => {
    // If url contains parameter "page" show loading only at the bottom
    if (!url.includes("page=")) {
      if (this._isMounted) {
        this.setState({
          isLoading: true,
        });
      }
    } else {
      if (this._isMounted) {
        this.setState({
          isLoadingNew: true,
        });
      }
    }

    fetch(url)
      // We get the API response and receive data in JSON format...
      .then((response) => response.json())
      // ...then we update the users state
      .then((data) => {
        let nextPage = "";
        if (data.meta) {
          if (data.meta.next) {
            nextPage = data.meta.next;
          }
        }

        const sortedData = sortEventsByDay(data.data);
        let eventDataToSave;

        // If the url to fetch has parameter "page", get the old events from state and append new to the end
        if (url.includes("page=")) {
          let oldEvents = this.state.events;
          oldEvents.meta = data.meta;

          sortedData.map((event) => {
            oldEvents.data.push(event);
          });

          let eventsToday = { meta: { next: null, count: 0 }, data: [] };
          eventsToday.data = filterEventsForToday(oldEvents.data);
          eventsToday.meta.count = eventsToday.data.length;

          if (this._isMounted) {
            this.setState({
              events: oldEvents,
              isLoadingNew: false,
              hasNextPage: nextPage,
              eventsToday: eventsToday,
            });
          }

          eventDataToSave = oldEvents;
        } else {
          let newData = data;
          newData.data = sortedData;

          let eventsToday = { meta: { next: null, count: 0 }, data: [] };
          eventsToday.data = filterEventsForToday(newData.data);
          eventsToday.meta.count = eventsToday.data.length;

          if (this._isMounted) {
            this.setState({
              events: newData,
              isLoading: false,
              hasNextPage: nextPage,
              eventsToday: eventsToday,
            });
          }

          eventDataToSave = newData;
        }

        db.events.put({ id: 1, data: eventDataToSave });
      })
      // Catch any errors we hit and update the app
      //.catch((error) => console.error("Fetch error: " + error));
      .catch((error) => {
        const errorMsg = {
          message: "Uusia tapahtumia ei voitu hakea.",
        };
        db.events.get(1).then((items) => {
          if (this._isMounted) {
            this.setState({
              events: items.data,
              isLoading: false,
              isLoadingNew: false,
              errorMsg: errorMsg,
              isFetchError: true,
            });
          }
        });
        console.error(error);
      });
    //}
  };

  renderFilters = () => {
    if (this.state.settings["filters"]["includeFilterBar"] === true) {
      return (
        <FilterBar>
          {this.state.settings["filters"]["includeTextFilter"] === true && (
            <TextFilter
              handleQuery={this.handleQuery}
              value={this.state.query}
            />
          )}
          {this.state.settings["filters"]["includeKeywordFilter"] === true && (
            <KeywordFilter
              keywords={this.state.keywords}
              handleSelect={this.handleKeywordSelect}
            />
          )}
          {this.state.settings["filters"]["includePostalCodeFilter"] ===
            true && (
              <LocationFilter
                locations={this.state.locations}
                handleLocationSelect={this.handleLocationSelect}
              />
            )}
          {this.state.settings["filters"]["includeTimeFilter"] === true && (
            <DateFilter
              handleStart={this.handleStart}
              handleEnd={this.handleEnd}
              startDateFromState={this.state.startDate}
              endDateFromState={this.state.endDate}
            />
          )}
          <div className={eventsStyles.EventsSearchButtonContainer}>
            <div className={eventsStyles.EventsSearchButton}>
              <EventButton clickHandler={this.getFilters}>Hae</EventButton>
            </div>
            <div className={eventsStyles.EventsSearchButton}>
              <EventButton clickHandler={this.clearFilters}>
                Tyhjennä hakuehdot
              </EventButton>
            </div>
          </div>
        </FilterBar>
      );
    }
  };

  render() {
    const {
      isLoading,
      isLoadingNew,
      events,
      eventsToday,
      errorMsg,
      keywords,
      locations,
      query,
      hasNextPage,
      isFetchError,
    } = this.state;

    return (
      <>
        <header className={mainStyles.AppHeader}>
          <Navbar />
          <div className={mainStyles.AppHeaderImgContainer}>
            <div className={mainStyles.AppHeaderImgEvents}>
              <div className={mainStyles.Layer}></div>
            </div>
            <div className={mainStyles.AppHeaderImgTitle}>
              <h1>Tapahtumat</h1>
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
              <div className={eventsStyles.EventsContainer}>
                <>{this.renderFilters()}</>

                {/* // Display a message if we encounter an error */}
                {isFetchError && (
                  <PopUp
                    title={"Hups, jotain meni vikaan!"}
                    content={
                      "Uusimpia tapahtumia ei voitu hakea, tarkista laitteen pääsy Internetiin."
                    }
                    iconStyle={"portable_wifi_off"}
                    buttonText={"OK"}
                  />
                )}

                {/* Show events or a loading indicator. IsLoadingNew shows when new events are loaded with the same filters */}
                {!isLoading ? (
                  <>
                    <Tabs className={eventsStyles.Tabs}>
                      <Tab
                        className={eventsStyles.Tab}
                        options={{
                          duration: 300,
                          onShow: null,
                          responsiveThreshold: Infinity,
                          swipeable: false,
                        }}
                        title="Tänään tapahtuu"
                      >
                        <EventList
                          data={eventsToday}
                          clickHandler={this.getNextHandler}
                        />
                      </Tab>
                      <Tab
                        active
                        className={eventsStyles.Tab}
                        options={{
                          duration: 300,
                          onShow: null,
                          responsiveThreshold: Infinity,
                          swipeable: false,
                        }}
                        title="Kaikki tapahtumat"
                      >
                        <EventList
                          data={events}
                          clickHandler={this.getNextHandler}
                        />
                        {!isLoading && !isLoadingNew && hasNextPage ? (
                          <div className={eventsStyles.EventsButton}>
                            <EventButton clickHandler={this.getNextHandler}>
                              Lataa lisää
                            </EventButton>
                          </div>
                        ) : null}
                        {!isLoading && isLoadingNew ? (
                          <div className={eventsStyles.LoadingContent}>
                            <Preloader
                              active
                              flashing={false}
                              size="big"
                              className={eventsStyles.HML}
                              key={"loaderKey"}
                            />
                          </div>
                        ) : null}
                      </Tab>
                    </Tabs>
                  </>
                ) : (
                  // If there is a delay in data, let's let the user know it's loading
                  <>
                    <div className={eventsStyles.LoadingContent}>
                      <Preloader
                        active
                        flashing={false}
                        size="big"
                        className={eventsStyles.HML}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }
}

export default Tapahtumat_module;
