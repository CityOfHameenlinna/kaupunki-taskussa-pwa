import M from "materialize-css/dist/js/materialize.min.js";
import React, { Component } from "react";
import { getCookieConsentValue } from "react-cookie-consent";
import { isAndroid, isIOS } from "react-device-detect";
import navitems from "../../settings.json";
import "../css/navbar.scss";
import { pageview } from "../helpers/GoogleAnalytics";
import PopUp from "./PopUpComponent";

class Navbar extends Component {
  constructor() {
    super();
    this.state = {
      NoInternet: false
    };
  }
  componentDidMount() {
    let sidenav = document.querySelector("#slide-out");
    M.Sidenav.init(sidenav, {});
    let slideOutListContainer = document.getElementById("slide-out");
    //fetch nav items from settings.json
    for (let i = 0; i < navitems.settings.length; ++i) {
      let listItem = document.createElement("li");
      let listLink = document.createElement("a");

      listLink.innerHTML = navitems.settings[i].navBarName;
      console.log("NAVBAR:");
      console.log(navitems.settings);
      //Check if item has market links configured
      if (navitems.settings[i].hasOwnProperty("market_links")) {
        if (isIOS && navitems.settings[i].hasOwnProperty("ios_link")) {
          listLink.href = navitems.settings[i].market_links.ios_link;
        } else if (
          isAndroid &&
          navitems.settings[i].market_links.hasOwnProperty("android_link")
        ) {
          listLink.href = navitems.settings[i].market_links.android_link;
        } else {
          listLink.href = navitems.settings[i].url;
        }
        if (getCookieConsentValue() == "true") {
          listLink.onclick = function () {
            pageview(listLink.href, navitems.settings[i].navBarName);
          };
        }
      } else {
        
        if (!navitems.settings[i].url || navitems.settings[i].useIframe) {
          listLink.href = "#" + navitems.settings[i].navBarName.replace(/ /g,'-');
          console.log("LINK TO :");
          console.log(listLink.href);
        } else {
          listLink.href = navitems.settings[i].url;
          //listLink.addEventListener("click", outboundLink(navitems.settings[i].url), false)
          //listLink.onclick = function() {outboundLink(navitems.settings[i].url)}
          if (getCookieConsentValue() == "true") {
            listLink.onclick = function () {
              pageview(
                navitems.settings[i].url,
                navitems.settings[i].navBarName
              );
            };
          }
        }
      }
      listItem.appendChild(listLink);
      slideOutListContainer.appendChild(listItem);
    }

    //handle nav item click
    document.body.addEventListener("click", function (e) {
      // e.target was the clicked element
      //Get screen size, do not close side nav when item clicked if screen size is over 922 px
      const width =
        window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth;
      if (width < 992) {
        if (e.target && e.target.nodeName == "A") {
          let instance = M.Sidenav.getInstance(sidenav);
          instance.close();
        }
      }
      //SCROLL UP if page changes
      try {
        let toElement = e.target.getAttribute("href");
        let fromElement = e.view.location.hash;
        if (toElement != null) {
          if (fromElement != toElement) {
            window.scrollTo(0, 0);
          }
        }
      } catch (error) {
        console.log("Can't scroll to top: " + error);
      }
    });
    
    window.ononline = (event) => {
      console.log("Back Online");
      this.setState({ NoInternet: false });
    };

    window.onoffline = (event) => {
      console.log("Connection Lost");
      this.setState({ NoInternet: true });
    };
  }

  render() {
    const {
      NoInternet
    } = this.state;
    //side nav close button click handler
    function closeOnClick() {
      let sidenav = document.querySelector("#slide-out");
      let instance = M.Sidenav.getInstance(sidenav);
      instance.close();
    }

    return (
      <div>
        {NoInternet ? (<PopUp title={"Näyttää siltä että Internet-yhteys katkesi!"} content={"Tarkista laitteen pääsy Internetiin."} iconStyle={"portable_wifi_off"} buttonText={"OK"}></PopUp>) : (<></>)}
        <div className="nav-main-container">
          <nav>
            <div className="nav-wrapper navbar-color">
              <a href="#" data-target="slide-out" className="sidenav-trigger">
                <i id="sidenav-icon" className="material-icons">
                  menu
              </i>
              </a>
              <ul id="nav-mobile" className="right hide-on-med-and-down"></ul>
              <div className="nav-top-image-container">
                <a href="#/">
                  <div className="nav-top-image" />
                </a>
              </div>
            </div>
          </nav>
          <ul id="slide-out" className="sidenav sidenav-fixed">
            <div className="sidenav-top-image">
              <i
                className="side-nav-closeicon material-icons white-text"
                onClick={closeOnClick}
              >
                close
            </i>
            </div>
            <li>
              <a href="#/">Etusivu</a>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}
export default Navbar;
