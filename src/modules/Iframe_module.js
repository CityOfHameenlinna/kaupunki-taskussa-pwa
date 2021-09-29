import React, { Component } from "react";
import classes from "../css/App.module.scss";
import Navbar from "../js/NavBar";
import Iframe from "../js/IframeContent";
import itemSettings from "../../settings.json";
//import RouteKeys from "../../routekeys.json";

class Iframe_module extends Component {

    ModuleSettings = (itemSettings) => {
        let settings = [];
        //This path has to bee same as settings.json rssfeed module name.
        
        var pathName = window.location.href;
        var urlName = pathName.substr(pathName.lastIndexOf('/') + 1);
        console.log("PATH NAME: " + urlName);
        const path = urlName;
        //Fetching right settings for rss feed by path name
        settings.push(itemSettings.settings.find((x) => x.name == path));
        return settings;
        };
  constructor() {
    super();
    let settings = this.ModuleSettings(itemSettings);
    this.state = {
      settings: settings[0],
      iframeUrl:settings[0].url
    };
    // RouteKeys.routekeys.map((item) => {
    //   if (item.name == "Luontopolut") {
    //     this.state = { url: item.url };
    //   }
    // });
    //Fetch RSS FEED settings from settings.json file
    // state = {
    //     name: window.location.pathname,
    //   };
  }
  
  

  componentDidMount() {
    const path = window.location.pathname;
    console.log("Component did mount: " + path);
    window.addEventListener("hashchange", this.reloadModule, false);
    // window.onhashchange = onhashChanged();
    // function onhashChanged() {
    //   // //document.getElementById("hash").innerHTML = hash;
    //   console.log("Hash changed");
    //   // let settings = this.ModuleSettings(itemSettings);
    //   // let iframeUrl = settings[0].url;
    //   // this.setState({iframeUrl:iframeUrl});
    //   // // this.reloadModule();
    // }
    
    
  }
  
  reloadModule = () =>{
    let iframeUrl = "";
      let settings= [];
      var pathName = window.location.href;
      var urlName = pathName.substr(pathName.lastIndexOf('/') + 1);
      console.log("PATH NAME: " + urlName);
      const path = urlName;
      //Fetching right settings for rss feed by path name
      settings.push(itemSettings.settings.find((x) => x.name == path));
      iframeUrl = settings[0].url;
      console.log(settings);
      this.setState({iframeUrl:iframeUrl});
  }
  unMountIt = ()=>{console.log("HASH CHANGE UNMOUNT")}
  componentWillUnmount() {
    console.log("UNMOUNT Called");
    this._isMounted = false;
    window.removeEventListener("hashchange", this.unMountIt, false);
  }
  render() {
    const {
        iframeUrl
      } = this.state;
    return (
      <>
        <header className={classes.AppHeader}>
          <Navbar />
        </header>
          <Iframe url={iframeUrl} />
      </>
    );
  }
}

export default Iframe_module;