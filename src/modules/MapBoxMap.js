import React, { useRef, useState, useEffect } from "react";
import { Col, Icon, Row } from "react-materialize";
import mapboxgl from "!mapbox-gl";
import mapboxSettings from "../../settings.json";
import lipasStyles from "../css/LipasAPI/LipasAPI.module.scss";
import markerImage from "../img/markerDefault.png";
import { Preloader } from "react-materialize";
import M from "materialize-css/dist/js/materialize.min.js";
import { db } from "../../dexieDB";

// mapboxgl.accessToken = "pk.eyJ1IjoiYW50dGlqdW4iLCJhIjoiY2o2dzdvNDRiMXFhbjMzbzNpem1wcWR2aSJ9.SxRcA3SvwQjdarJFSAMq4g";

class MapBoxMap extends React.Component {
  // mapContainer = useRef();
  //Fetch RSS FEED settings from settings.json file
  mapboxModuleSettings = (mapboxSettings) => {
    let settings = [];
    //This path has to bee same as settings.json rssfeed module name.
    const path = "LipasAPI";
    //Fetching right settings for rss feed by path name
    settings.push(mapboxSettings.settings.find((x) => x.name == path));
    return settings;
  };
  //TODO fix map popup scrollable content
  //Common variables
  //Contains rows for Filter container
  Filter = (<Row></Row>);
  //currentPop up instance
  currentPopUp = null;
  //Filter Button instance
  instancesFAB = null;
  //FilterButton element instance
  fabElemInstance = null;
  //Places list button instance
  instanceFabList = null;
  //Place list button Element instance
  fabElemInstanceList = null;
  //Currently active filter ID (button+filterName)
  currentlyActiveFilter = "";
  //Name for currently active filter (settings.json LipasAPI.settings.categories.namevalue)
  currentlyActiveFilterName = "";
  //bool for is filter container open
  fabIsOpen = false;
  //bool for is Places list open
  fabListIsOpen = false;
  //MapPinOffsetUpDown
  mapPinOffset = 120;
  //init map
  mapInit = () => {
    let settings = this.mapboxModuleSettings(mapboxSettings);
    let mapStyle = settings[0].mapBoxSettings.styleURL;
    mapboxgl.accessToken = settings[0].mapBoxSettings.accessToken;
    this.state = {
      lngStart: settings[0].mapBoxSettings.startLng,
      latStart: settings[0].mapBoxSettings.startLat,
      zoomStart: settings[0].mapBoxSettings.startZoom,
      dataExpires:settings[0].dataExpireMinutes
    };
    const { lngStart, latStart, zoomStart } = this.state;

    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: mapStyle,
      center: [lngStart, latStart],
      zoom: zoomStart,
      maxZoom: 18,
      minZoom: 5,
    });
    return map;
  };

  constructor(props) {
    super(props);
    this.state = {
      lngStart: 24.482,
      latStart: 60.9967,
      zoomStart: 7.5,
      fetched: false,
      loading: true,
      mapMoving: false,
      placeListData: null,
      dataExpires:30,
    };
    this.mapContainer = React.createRef();
  }

  map = null;
  componentDidMount() {
    this.map = this.mapInit();
    // match = useRouteMatch();
    // console.log("component did mount fired");
    document.getElementById("list-btn").style.display = "none";
    this._isMounted = true;
    this.Filter = this.createFilter();
    this.addImagesToMap(this.map);
    this.map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      }),
      "bottom-right"
    );
    // disable map rotation using right click + drag
    this.map.dragRotate.disable();
    // disable map rotation using touch rotation gesture
    this.map.touchZoomRotate.disableRotation();
    this.addEventListeners(this.map);

    this.fabOpen();
  }
  componentWillUnmount() {
    this._isMounted = false;
    this.map.remove();
  }
  //Map and dom event listeners
  addEventListeners = (map) => {
    //Map move
    this.map.on("move", () => {
      this.setState({ mapMoving: true });

      const { lng, lat } = this.map.getCenter();
      // console.log("lng: " + lng);
      // console.log("lat: " + lat);
      this.setState({
        lng: lng.toFixed(4),
        lat: lat.toFixed(4),
        zoom: this.map.getZoom().toFixed(2),
      });
    });
    //Map idle
    map.on("idle", (e) => {
      // do things every time the map idles
      this.setState({ mapMoving: false });
    });
    //Click map
    this.map.on(
      "click",
      function (e) {
        this.fabClose();
      }.bind(this)
    );
    //Click map marker
    this.map.on(
      "click",
      "unclustered-point",
      function (e) {
        let zoom = this.map.getZoom();
        // console.log("Point clicked");
        var coordinates = e.features[0].geometry.coordinates.slice();
        let descriptionHTML = this.createPopUpHTML(e.features[0]);
        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
        map.flyTo({
          center: coordinates,
          essential: true,
          offset: [0, this.mapPinOffset],
        });

        this.popUpAdd(coordinates, descriptionHTML);
      }.bind(this)
    );
    // inspect a cluster on click
    this.map.on(
      "click",
      "clusters",
      function (e) {
        var features = map.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });
        var clusterId = features[0].properties.cluster_id;
        map
          .getSource("Markers")
          .getClusterExpansionZoom(clusterId, function (err, zoom) {
            if (err) return;

            map.easeTo({
              center: features[0].geometry.coordinates,
              zoom: zoom,
            });
          });
      }.bind(this)
    );
    // Change the cursor to a pointer when the mouse is over the places layer.
    this.map.on(
      "mouseenter",
      "unclustered-point",
      function () {
        this.map.getCanvas().style.cursor = "pointer";
      }.bind(this)
    );

    // Change it back to a pointer when it leaves.
    this.map.on(
      "mouseleave",
      "unclustered-point",
      function () {
        this.map.getCanvas().style.cursor = "";
      }.bind(this)
    );
    this.fabElemInstance = document.querySelector(".filter-btn");
    this.instancesFAB = M.FloatingActionButton.init(this.fabElemInstance, {
      direction: "left",
      toolbarEnabled: false,
      hoverEnabled: false,
    });
    this.fabElemInstance.addEventListener("click", this.fabClick);
    this.fabElemInstanceList = document.querySelector(".list-btn");
    this.instancesFABList = M.FloatingActionButton.init(
      this.fabElemInstanceList,
      {
        direction: "top",
        toolbarEnabled: false,
        hoverEnabled: false,
      }
    );
    this.fabElemInstanceList.addEventListener("click", this.fabClickList);
    let element = document.getElementById("list-btn");
    if (window.innerWidth > 991) {
      element.style.left = "300px";
    }
    window.addEventListener("resize", function (event) {
      var newWidth = window.innerWidth;
      var newHeight = window.innerHeight;
      if (newWidth > 991) {
        element.style.left = "300px";
      } else {
        element.style.left = "0px";
      }
    });
  };
  //Close pop up with this function
  popUpClose = function () {
    if (this.currentPopUp) {
      this.currentPopUp.remove();
    }
  };
  //Create HTML text for popup, returns HTML string
  createPopUpHTML = (item) => {
    let dataJson = JSON.parse(Object.values(item)[1].properties.apiData);
    let address = dataJson.location.address ?? "";
    let postalCode = dataJson.location.postalCode ?? "";
    let postalOffice = dataJson.location.postalOffice ?? "";
    let www = dataJson.www ?? "";
    let linkHtml = "";
    //Check if item has a link and create HTMl if has
    if (www) {
      linkHtml =
        '<i style="margin:5px" class="tiny material-icons blue-text">link</i><a target="_blank" href=' +
        www +
        ">www</a>";
    }
    let descriptionHTML =
      "<div class=" +
      lipasStyles.mapPopUpContent +
      ">" +
      "<h6>" +
      Object.values(item)[1].properties.name +
      "</h6>" +
      "<p>" +
      Object.values(item)[1].properties.info +
      "</p>" +
      "<p>" +
      '<i style="margin:5px" class="tiny material-icons blue-text">pin_drop</i><a target="_blank" href=' +
      Object.values(item)[1].properties.directionUrl +
      ">" +
      address +
      ", " +
      postalOffice +
      "</a>" +
      "</p>" +
      "<p>" +
      linkHtml +
      "</p></div>";

    return descriptionHTML;
  };
  //Add popup
  popUpAdd = (coordinates, descriptionHTML) => {
    this.currentPopUp = new mapboxgl.Popup({ offset: [0, -25] })
      .setLngLat(coordinates)
      .setHTML(descriptionHTML)
      .addTo(this.map);
    let closeElement = document.querySelector(".mapboxgl-popup-close-button");
    if (closeElement) {
      closeElement.style.fontSize = "25px";
      closeElement.style.color = "#f77952";
    } else {
      console.log("map popup button element is null");
    }
  };

  addImagesToMap = (map) => {
    map.loadImage(markerImage, function (error, image) {
      if (error) throw error;
      // Add the image to the map style.
      map.addImage("markerDefault", image);
    });
  };
  isEven = function (number) {
    if (isNaN(number)) {
      return "Input was not a number.";
      // } else if (number === 0) {
      //   return true;
    } else if (number % 2 === 0) {
      return true;
    } else {
      return false;
    }
  };
  createFilter() {
    const { lng, lat, zoom, fetched } = this.state;
    if (!fetched) {
      // console.log("Fetch rows");
      let categories = this.mapboxModuleSettings(mapboxSettings)[0].settings
        .categories;

      return this.addButtons(
        "RowKey01",
        Object.keys(categories),
        Object.values(categories)
      );
    } else {
    }
  }
  addButtons(rowKey, items, values) {
    if (!values || !items) {
      return null;
    }
    let icons = [];
    values.map((item, index) => {
      icons.push(item.icon);
    });
    let addedColsCount = 1;
    let rows = [];
    let cols = [];
    items.forEach((item, index) => {
      cols.push(this.addCol(item, icons[index], "colId" + index));
      if (!this.isEven(index)) {
        addedColsCount = index;
        rows.push(
          <Row key={rowKey + index} className={lipasStyles.rowit}>
            {cols}
          </Row>
        );
        cols = [];
      } else {
      }
      // addedColsCount = index;
      // rows.push(
      //   <Row key={rowKey + index} className={lipasStyles.rowit}>
      //     {cols}
      //   </Row>
      // );
      // cols = [];
    });
    if (items.length > addedColsCount) {
      rows.push(
        <Row key={rowKey + "last"} className={lipasStyles.rowit}>
          {cols}
        </Row>
      );
      cols = [];
    }
    return rows;
  }
  addCol(item, icon, colId) {
    var buttonID = "button" + item.replace(/ /g, "");
    this.setState({ fetched: true, loading: false });
    return (
      <Col key={colId} xs={3} className={lipasStyles.colit}>
        <button
          id={buttonID}
          className={lipasStyles.button}
          onClick={() => {
            this.fetchLocations(item);
          }}
        >
          <Icon
            key={colId + "icon"}
            small
            className={lipasStyles.ActivityColor}
          >
            {icon}
          </Icon>
          <br />
          <p>{item}</p>
        </button>
      </Col>
    );
  }
  fabClose = async () => {
    await this.animate("." + lipasStyles.rowContainer, "closeFilter");
    const { loading, placeListData } = this.state;
    if (placeListData && !loading) {
      await this.animate(".list-btn", "showListBtn");
    }
    this.fabIsOpen = false;
  };
  fabOpen = async () => {
    await this.animate("." + lipasStyles.rowContainer, "openFilter");
    const {placeListData } = this.state;
    if (placeListData) {
      await this.fabListClose();
      await this.animate(".list-btn", "hideListBtn");
    }
    this.fabIsOpen = true;
  };
  fabClick = () => {
    if (this.instancesFAB) {
      if (this.fabIsOpen) {
        this.fabClose();
      } else {
        this.fabOpen();
      }
    } else {
      console.warn("FabClick, Fab is not initialized!");
    }
  };
  fabListClose = async () => {
    await this.animate("." + lipasStyles.placeListContainer, "closePlaceList");
    // this.fabElemInstanceList.classList.remove("active");
    this.fabListIsOpen = false;
  };
  fabListOpen = async () => {
    await this.animate("." + lipasStyles.placeListContainer, "openPlaceList");

    // this.fabElemInstanceList.classList.add("active");
    this.fabListIsOpen = true;
  };
  fabClickList = () => {

    if (this.instancesFABList) {
      if (this.fabListIsOpen) {
        this.fabListClose();
      } else {
        this.fabListOpen();
      }
    } else {
      console.warn("FabClick LIST, Fab is not initialized!");
    }
  };
  fetchLocations = async (page) => {
    const { lngStart, latStart, zoomStart } = this.state;
    this.map.flyTo({
      center: [lngStart, latStart],
      essential: true,
      zoom: zoomStart,
    });
    this.setState({ loading: true });
    if (this.currentlyActiveFilter) {
      document.getElementById(
        this.currentlyActiveFilter
      ).style.backgroundColor = "";
      document.getElementById(this.currentlyActiveFilter).style.borderColor =
        "rgba(10, 46, 89, 1)";
      this.hideMapLayers(true);
    }
    this.currentlyActiveFilter = "button" + page.replace(/ /g, "");
    this.currentlyActiveFilterName = page;
    document.getElementById(this.currentlyActiveFilter).style.backgroundColor =
      "rgba(247, 121, 82,0.2)";
    document.getElementById(this.currentlyActiveFilter).style.borderColor =
      "#f77952";
    this.popUpClose();
    this.fabClose();
    let urlToFetch = null;

    let lipasSettings = this.mapboxModuleSettings(mapboxSettings);

    let categories = lipasSettings[0].settings.categories;
    let currentPageObj;
    Object.entries(categories).map((item, index) => {
      if (Object.values(item)[0] === page) {
        currentPageObj = item;
        // console.log("Current page object found...");
      }
    });
    let hasMore = true;
    if(!lipasSettings[0].settings.cityCodes[0])
    {
      console.warn("NO CITY CODE ON settings.json! add cityCodes:[100]")
      hasMore= false;
    }
    
    let queryString = "?cityCodes=" + lipasSettings[0].settings.cityCodes[0];
    let typeCodesList = currentPageObj[1].typeCodes;
    typeCodesList.forEach((item, index) => {
      queryString = queryString + "&typeCodes=" + item;
    });
    urlToFetch = lipasSettings[0].requestUrl + queryString;
    let listResp = [];
    var count = 0;
    do {
      count++;
      try {
        await fetch(urlToFetch + "&page=" + count)
        .then((response) => response.json())
        .then((resp) => {
          console.log(resp);
          if (resp && resp.length !== 0) {
            listResp = listResp.concat(resp);
          } else {
            hasMore = false;
          }
        });
      } catch (error) {
        console.warn("Error at fetch lipasAPI pages");
        hasMore = false;
        console.warn("fetch failed, trying to fetch backup from db...: " + error);
        
        let mapData = await this.getFeatureCollectionFromDb();
        let listData = await this.getPlacesListFormDb();
        if(mapData&&listData)
        {
          this.setMapData(mapData);
          this.hideMapLayers(false);
          let listItems = this.getListItems(listData);
          this.setState({ loading: false, placeListData: listItems });
        }
        else
        {
          console.warn("fetch failed, cannot get data from db or LipasAPI");
          this.setState({ loading: false});
        }
      }

    }while (hasMore);
    console.log("list rep:");
    console.log(listResp);
    if(listResp &&listResp.length >0)
    {
      this.fetchDetails(listResp);
    }
  };
  fetchDetails = async (idArray) => {
    
    let lipasSettings = this.mapboxModuleSettings(mapboxSettings);
    const lipasBaseUrl = lipasSettings[0].requestUrl;
    let resultsArray = [];
    let itemsFetched = 0;
    let featureList = [];
    var fetchNewData = true;
    let listData = await this.getPlacesListFormDb();
    console.log("Data is expired: " + await this.checkIsDataExpired());
    console.log("places list length: " + listData.length)
    if(await this.checkIsDataExpired() || listData.length === 0|| typeof listData === "undefined")
    {
      
      fetchNewData = true;
    }
    else
    {
      fetchNewData = false;
      let mapData = await this.getFeatureCollectionFromDb();
      if (mapData && listData) {
        console.log("map data found in db:");
        this.setMapData(mapData);
        this.hideMapLayers(false);
        let listItems = this.getListItems(listData);
        this.setState({ loading: false, placeListData: listItems });
        } else {
        fetchNewData = true;
      }
    }

    if (fetchNewData) {
      console.log("no featurecollection on db, create new");
      idArray.forEach(async(element) => {
        if (lipasBaseUrl.includes("undefined")) {
          console.log("skip bad request");
          itemsFetched++;
        } else {
          try {
          await fetch(lipasBaseUrl + "/" + element.sportsPlaceId)
            .then(async(details) => details.json())
            .then(async(detailsObj) => {
              resultsArray.push(detailsObj);
              itemsFetched++;

              if (itemsFetched == idArray.length) {
                if (this._isMounted == true) {
                  resultsArray.forEach((item, index) => {
                    if (typeof item.location !== "undefined" && item.location) {
                      if (
                        typeof item.location.coordinates !== "undefined" &&
                        item.location.coordinates
                      ) {
                        if (
                          typeof item.location.coordinates.wgs84 !==
                            "undefined" &&
                          item.location.coordinates.wgs84
                        ) {
                          let properties =lipasSettings[0].popUpDataNotAvailable

                          if (
                            item.properties !== "undefined" &&
                            item.properties
                          ) {
                            if (
                              item.properties.infoFi !== "undefined" &&
                              item.properties.infoFi
                            ) {
                              properties = item.properties.infoFi;
                            }
                          }

                          let directionsURL =
                            "https://www.google.com/maps/search/?api=1&query=" +
                            item.location.coordinates.wgs84.lat +
                            "," +
                            item.location.coordinates.wgs84.lon;

                          let feature = {
                            type: "Feature",
                            properties: {
                              name: item.name,
                              time: item.lastModified,
                              directionUrl: directionsURL,
                              info: properties,
                              apiData: JSON.stringify(item),
                            },
                            geometry: {
                              type: "Point",
                              coordinates: [
                                item.location.coordinates.wgs84.lon,
                                item.location.coordinates.wgs84.lat,
                              ],
                            },
                          };
                          featureList.push(feature);
                        } else {
                          console.log("No location wgs84 for: " + item.name);
                        }
                      } else {
                        console.log(
                          "No location coordinates for: " + item.name
                        );
                      }
                      // }
                    } else {
                      console.log("No location for: " + item.name);
                    }
                  });
                }
              }
              if (idArray.length === itemsFetched) {
                if(featureList)
                {
                let featureCollection = {
                  type: "FeatureCollection",
                  crs: {
                    type: "name",
                    properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" },
                  },
                  features: featureList,
                };
                db.mapData.put({
                  id: this.currentlyActiveFilterName,
                  data: featureCollection,
                  timestamp:Date.now()
                });
                db.mapPlaceListData.put({
                  id: this.currentlyActiveFilterName,
                  data: featureList,
                  timestamp:Date.now()
                });
                this.setMapData(featureCollection);
                this.hideMapLayers(false);
                let listItems = this.getListItems(featureList);
                this.setState({ loading: false, placeListData: listItems });
              }
              else
              {
                console.warn("fetch failed, cant get map data, trying to fetch backup from db...");
                let mapData = await this.getFeatureCollectionFromDb();
                let listData = await this.getPlacesListFormDb();
                if(mapData&&listData)
                {
                  this.setMapData(mapData);
                  this.hideMapLayers(false);
                  let listItems = this.getListItems(listData);
                  this.setState({ loading: false, placeListData: listItems });
                }
                else
                {
                  console.warn("fetch failed, cannot get data from db or LipasAPI");
                }
              }
            }
            });
            
          } catch (error) {
            console.warn("fetch failed, cant get map data, trying to fetch backup from db...: " + error);
                let mapData = await this.getFeatureCollectionFromDb();
                let listData = await this.getPlacesListFormDb();
                if(mapData&&listData)
                {
                  this.setMapData(mapData);
                  this.hideMapLayers(false);
                  let listItems = this.getListItems(listData);
                  this.setState({ loading: false, placeListData: listItems });
                }
                else
                {
                  console.warn("fetch failed, cannot get data from db or LipasAPI");
                }
          }
          
        }
      });
    }
  };
  checkIsDataExpired = async()=>{
    const { dataExpires } = this.state;
    let skipAfterTicks = dataExpires*10000;
    var isDataExpired = true;
    console.log("Check is " + this.currentlyActiveFilterName + " old");
    try {
      await db.mapData
      .get({ id: this.currentlyActiveFilterName })
      .then(async(items) => {
        if (items && typeof items.data !=='undefined') {
          console.log(items.timestamp);
          console.log(Date.now());
          var diff = Date.now()-parseInt(items.timestamp);
          console.log(diff);
          // var mins = Math.floor(parseInt(diff)/(1000*60*60));
          var sec = parseInt(diff)/1000;
          var mins = parseInt(sec)/60;
          var ticksLeft = skipAfterTicks - diff;
          var secLeft = parseInt(ticksLeft)/1000;
          var minsLeft = parseInt(secLeft)/60;
          
          if(items.timestamp>(Date.now()-skipAfterTicks))
          {
            if(mins>=1)
          {
            console.log("data has " + parseFloat(minsLeft).toFixed(0)+ "mins left to expire");
          }
          else
          {
            console.log("data has " + parseFloat(secLeft).toFixed(0) + "sec left to expire");
          }
          
          isDataExpired = false;
          }
          else
          {
            console.log("Old data at db");
            isDataExpired = true
          }
        }
      });
    } catch (error) {
      console.warn("Cant check is db data expired");
      console.warn(error);
      isDataExpired = true;
    }
    return isDataExpired;
   
  }
  getPlacesListFormDb=async()=>{
    let listData = null;
    try {
      await db.mapPlaceListData
      .get({ id: this.currentlyActiveFilterName })
      .then((items) => {
        if(items &&typeof items.data !=='undefined')
        {
        listData = items.data;
        }
      });
    } catch (error) {
      console.warn("Cant get map place list data from db: ");
      console.warn(error);
    }
   
    return listData;
  }
  
  getFeatureCollectionFromDb = async()=>{
    let mapData = null;
    try {
      await db.mapData
      .get({ id: this.currentlyActiveFilterName })
      .then(async(items) => {
        if (items && typeof items.data !=='undefined') {

            mapData = items.data;
          }
          else
          {
            console.warn("Cant return map data!");
            mapData = null;
          }
        }
      );
    } catch (error) {
      console.warn("Cant return map data!");
      console.warn(error);
    }
    
    return mapData;
  }
  setMapData = (featureCollection) => {
    if (this.map.getSource("Markers")) {
      this.map.getSource("Markers").setData(featureCollection);
    } else {
      this.map.addSource("Markers", {
        type: "geojson",
        data: featureCollection,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });
      this.map.addLayer({
        id: "clusters",
        type: "circle",
        source: "Markers",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#F77952",
          "circle-radius": [
            "step",
            ["get", "point_count"],
            20,
            100,
            30,
            750,
            40,
          ],
        },
        layout: {
          visibility: "visible",
        },
      });
      this.map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "Markers",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12,
          visibility: "visible",
        },
      });
      this.map.addLayer({
        id: "unclustered-point",
        type: "symbol",
        source: "Markers",
        filter: ["!", ["has", "point_count"]],
        layout: {
          "icon-image": "markerDefault",
          "icon-size": 0.6,
          "icon-allow-overlap": true,
          visibility: "visible",
        },
      });
    }
  };
  hideMapLayers = (hide) => {
    if (hide) {
      var visibility = this.map.getLayoutProperty(
        "cluster-count",
        "visibility"
      );
      if (visibility === "visible") {
        this.map.setLayoutProperty("cluster-count", "visibility", "none");
      }
      visibility = this.map.getLayoutProperty(
        "unclustered-point",
        "visibility"
      );
      if (visibility === "visible") {
        this.map.setLayoutProperty("unclustered-point", "visibility", "none");
      }
      visibility = this.map.getLayoutProperty("clusters", "visibility");
      if (visibility === "visible") {
        this.map.setLayoutProperty("clusters", "visibility", "none");
      }
    } else {
      var visibility = this.map.getLayoutProperty(
        "cluster-count",
        "visibility"
      );
      if (visibility === "none") {
        this.map.setLayoutProperty("cluster-count", "visibility", "visible");
      }
      visibility = this.map.getLayoutProperty(
        "unclustered-point",
        "visibility"
      );
      if (visibility === "none") {
        this.map.setLayoutProperty(
          "unclustered-point",
          "visibility",
          "visible"
        );
      }
      visibility = this.map.getLayoutProperty("clusters", "visibility");
      if (visibility === "none") {
        this.map.setLayoutProperty("clusters", "visibility", "visible");
      }
    }
  };
  handleListItemClick = (item) => {
    this.popUpClose();
    var coordinates = Object.values(item)[1].geometry.coordinates.slice();
    let descriptionHTML = this.createPopUpHTML(item);
    this.map.flyTo({
      center: coordinates,
      essential: true,
      zoom: 16,
      offset: [0, this.mapPinOffset],
    });

    this.popUpAdd(coordinates, descriptionHTML);
  };
  getListItems = (listData) => {
    if (listData) {
      let listOfLis = [];
      let sortedList = [];
      Object.entries(listData).map((item, index) => {
        var itemKey = Object.values(item)[1].properties.name + index;
        listOfLis.push(
          <li key={itemKey} onClick={() => this.handleListItemClick(item)}>
            {Object.values(item)[1].properties.name}
          </li>
        );
      });
      sortedList = listOfLis.sort((a, b) => a.key.localeCompare(b.key));
      this.animate(".list-btn", "showListBtn");
      return (
        <div key="listItemDiv" className={lipasStyles.placeListContainer}>
          <ul key="ListItemUl">
            <li>
              <h5>{this.currentlyActiveFilterName}</h5>
            </li>
            {sortedList}
          </ul>
        </div>
      );
    }
  };
  render() {
    const {
      lngStart,
      latStart,
      zoomStart,
      loading,
      placeListData,
    } = this.state;
    return (
      <div>
        <div
          ref={(el) => (this.mapContainer = el)}
          className={lipasStyles.mapContainer}
        ></div>
        {loading ? (
          <div className={lipasStyles.LoadingContent}>
            <Preloader
              active
              flashing={false}
              size="big"
              color="red"
              className={lipasStyles.LoadingIcon}
            />
          </div>
        ) : (
          <></>
        )}
        <div
          id="filter-btn"
          className="fixed-action-btn filter-btn"
          style={{ bottom: "75%", right: "7px" }}
        >
          <a
            className="btn-floating btn-small waves-effect waves-light"
            style={{ backgroundColor: "rgba(10, 46, 89, 1)" }}
          >
            <i className="small material-icons">place</i>
          </a>
          <ul>
            <li>
              <div id="rowContainer" className={lipasStyles.rowContainer}>
                {this.Filter}
              </div>
            </li>
          </ul>
        </div>
        <div
          id="zoomStart-btn"
          className="fixed-action-btn zoomStart-btn"
          style={{ bottom: "84%", right: "7px" }}
          onClick={() =>
            this.map.flyTo({
              center: [lngStart, latStart],
              essential: true,
              zoom: zoomStart,
            })
          }
        >
          <a
            className="btn-floating btn-small waves-effect waves-light"
            style={{ backgroundColor: "rgba(10, 46, 89, 1)" }}
          >
            <i className="small material-icons">filter_center_focus</i>
            {/* <i className="small material-icons">zoom_out_map</i> */}
          </a>
        </div>

        <div
          id="list-btn"
          className="fixed-action-btn list-btn"
          style={{
            display: "flex",
            position: "fixed",
            justifyContent: "center",
            width: "50px",
            margin: "auto",
            display: "none",
            bottom: "-50px",
            left: "-25px",
            right: 0,
          }}
        >
          <a
            className="btn-floating btn-small waves-effect waves-light"
            style={{ backgroundColor: "rgba(10, 46, 89, 1)" }}
          >
            <i className="small material-icons">format_list_bulleted</i>
          </a>
          {loading ? (
            <div key="listItemDiv" className={lipasStyles.placeListContainer}>
              <ul key="ListItemUl">
                <li>
                  <h5>{this.currentlyActiveFilterName}</h5>
                </li>
                <div className={lipasStyles.LoadingContentList}>
                  <Preloader
                    active
                    flashing={false}
                    size="big"
                    color="red"
                    className={lipasStyles.LoadingIcon}
                  />
                </div>
              </ul>
            </div>
          ) : (
            <>{placeListData}</>
          )}
        </div>
      </div>
    );
  }

  //JS animations
  animate = async (elemID, animName) => {
    var nodes = document.querySelectorAll(elemID);
    var el = nodes[0];
    var elChild = nodes[0].childNodes;
    let fabElement = this.fabElemInstance;
    fabElement.disable = true;
    let fabElementList = this.fabElemInstanceList;
    fabElementList.disable;
    let autoHeight = el.offsetHeight;
    let autoWidth = el.offsetWidth;
    var innerWidth = window.innerWidth;
    var innerHeight = window.innerHeight;
    switch (animName) {
      case "openFilter":
        if (!this.fabIsOpen) {
          var loc = 0;
          var ids = setInterval(frameOpen, 1);
          el.style.display = "block";
          el.style.maxWidth = "auto";
          el.style.maxHeight = "auto";
          fabElement.classList.add("active");
          function frameOpen() {
            if (loc > 200) {
              console.warn("Animation failed, loop time out : " + animName);
              clearInterval(ids);
            }
            if (parseInt(el.style.height) >= 300) {
              clearInterval(ids);
              el.style.width = "auto";
              el.style.height = "auto";
              el.style.maxWidth = "240px";
              el.style.maxHeight = "380px";
              el.style.opacity = 1;
              elChild[0].style.display = "block";
              elChild[0].style.opacity = 1;
              for (var i = 1; i < elChild.length; i++) {
                var a = elChild[i];
                a.style.display = "block";
              }
              fabElement.disable = false;
            } else {
              loc++;
              var opacity = parseInt(loc) / 100;
              el.style.opacity = opacity;
              el.style.width = loc * 3 + "px";
              el.style.height = loc * 4 + "px";
            }
          }
        } else {
          console.log("filter already showing");
          fabElement.disable = false;
        }
        break;
      case "closeFilter":
        if (this.fabIsOpen) {
          for (var i = 0; i < elChild.length; i++) {
            var a = elChild[i];
            a.style.display = "none";
          }
          var loc = 0;
          var opacity = 1;
          el.style.maxWidth = "200px";
          el.style.maxHeight = "200px";
          var ids = setInterval(frameClose, 1);
          function frameClose() {
            if (loc > 200) {
              console.warn("Animation failed, loop time out : " + animName);
              clearInterval(ids);
            }
            if (parseInt(el.style.height) < 50) {
              clearInterval(ids);
              el.style.display = "none";
              el.style.width = "auto";
              el.style.opacity = 0;
              fabElement.classList.remove("active");
              fabElement.disable = false;
              el.style.height = "300px";
            } else {
              loc++;
              opacity = opacity - 0.01;
              el.style.opacity = opacity;
              el.style.width = (parseFloat(autoWidth) - loc) / (loc / 2) + "px";
              el.style.height =
                (parseFloat(autoHeight) - loc) / (loc / 2) + "px";
            }
          }
        } else {
          fabElement.disable = false;
        }
        break;
      case "showListBtn":
        if (parseInt(el.style.bottom) < -45) {
          var loc = 0;
          var opacity = 0;
          var ids = setInterval(frameShowListBtn, 20);
          el.style.bottom = "-50px";
          el.style.display = "flex";
          if (innerWidth > 922) {
            el.style.left = "300px";
          } else {
            el.style.left = "0px";
          }
          function frameShowListBtn() {
            if (loc > 200) {
              console.warn("Animation failed, loop time out : " + animName);
              clearInterval(ids);
            }
            if (parseInt(el.style.bottom) > 19) {
              clearInterval(ids);
              el.style.opacity = 1;
              el.style.bottom = "20px";
              fabElementList.disable = false;
            } else {
              loc++;
              var opacity = parseInt(loc) / 10;
              el.style.opacity = opacity;
              el.style.bottom = parseInt(el.style.bottom) + loc + "px";
            }
          }
        } else {
        }
        break;
      case "hideListBtn":
        if (parseInt(el.style.bottom) > 19) {
          var loc = 0;
          var opacity = 1;
          var ids = setInterval(frameHideListBtn, 30);
          el.style.bottom = "20px";
          el.style.display = "flex";
          function frameHideListBtn() {
            if (loc > 200) {
              console.warn("Animation failed, loop time out : " + animName);
              clearInterval(ids);
            }
            if (parseInt(el.style.bottom) < -45) {
              clearInterval(ids);
              el.style.opacity = 0;
              el.style.bottom = "-50px";
              fabElementList.disable = false;
            } else {
              loc++;
              opacity = opacity - 0.02;
              el.style.opacity = opacity;
              el.style.bottom = parseInt(el.style.bottom) - loc + "px";
            }
          }
        } else {
          fabElementList.disable = false;
        }
        break;
      case "openPlaceList":
        if (!this.fabListIsOpen) {
          var loc = 0;
          var ids = setInterval(frameOpen, 1);
          elChild[0].style.height = "0";
          elChild[0].style.display = "block";
          fabElementList.classList.add("active");
          elChild[0].scrollTop = 0;
          let listHeight = innerHeight;
          listHeight = listHeight / 1.5;
          function frameOpen() {
            if (loc > 200) {
              console.warn("Animation failed, loop time out : " + animName);
              clearInterval(ids);
            }
            if (parseInt(elChild[0].style.height) > listHeight) {
              clearInterval(ids);
              elChild[0].style.width = "auto";
              elChild[0].style.height = listHeight + "px";
              elChild[0].style.opacity = 1;
              elChild[0].style.display = "block";
              fabElementList.disable = false;
            } else {
              loc++;
              var opacity = parseInt(loc) / 100;
              elChild[0].style.opacity = opacity;
              elChild[0].style.height = loc * 20 + "px";
            }
          }
        } else {
          fabElementList.disable = false;
        }
        break;
      case "closePlaceList":
        if (this.fabListIsOpen) {
          var startOffset = elChild[0].offsetHeight;
          var loc = 0;
          var opacity = 1;
          var ids = setInterval(frameClose, 1);
          function frameClose() {
            if (loc > 200) {
              console.warn("Animation failed, loop time out : " + animName);
              clearInterval(ids);
            }
            if (parseInt(elChild[0].offsetHeight) <= 50) {
              clearInterval(ids);
              elChild[0].style.display = "none";
              elChild[0].style.width = "auto";
              elChild[0].style.opacity = 0;
              fabElementList.classList.remove("active");
              fabElementList.disable = false;
              elChild[0].style.height = "0";
            } else {
              loc++;
              opacity = opacity - 0.01;
              elChild[0].style.opacity = opacity;
              elChild[0].style.height =
                (parseFloat(startOffset) - loc) / (loc / 2) + "px";
            }
          }
        } else {
          fabElementList.disable = false;
        }
        break;
      default:
        console.warn(
          "Trying to fire animate function with name: " +
            animName +
            " to element: " +
            elemID +
            ". There is no animation with name: " +
            animName
        );
        break;
    }
  };
}

export default MapBoxMap;
