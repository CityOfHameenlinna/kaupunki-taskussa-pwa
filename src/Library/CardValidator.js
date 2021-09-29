import authData from "../Library/authentication.json";
import sendRequest from "./Fetch";
import settings from "../../settings.json";

const retrieveUserInformation = (number, pin) => {
  var librarySettings = function (settings) {
    let librarySettings = [];
    //This path has to bee same as settings.json rssfeed module name.
    const path = "Kirjastokortti";
    //Fetching right settings for rss feed by path name
    librarySettings.push(settings.settings.find((x) => x.name == path));
    return librarySettings;
  };
  let moduleSettings = librarySettings(settings);
  if (number.trim() === "" || pin.trim() === "") {
    console.log("Anna korttitiedot");
    alert("Kortin numero ja tunnusluku on pakko täyttää");
    //throw Error("Kortin numero ja tunnusluku on pakko täyttää");
  }

  try {
    return sendRequest(
      moduleSettings[0].proxyURL +
      authData.library.url +
      authData.library.username +
      number +
      authData.library.password +
      pin
    )
      .then((response) => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(response, "text/xml");

        let info = {
          status: xml
            .querySelector("Status")
            .firstChild.nodeValue.toLowerCase(),
          name:
            xml.querySelector("Name").firstChild != null
              ? xml.querySelector("Name").firstChild.nodeValue.toLowerCase()
              : null,
        };

        console.log(info);

        switch (info.status) {
          // Authentication was successful
          case "ok":
            return info;
          // Username and password were incorrect
          case "wrongbarcodeorpin":
            return "Antamasi kortin numero tai PIN-koodi oli väärin";
          // Username or password were incorrect
          case "missingpwd":
            return "Antamasi kortin numero tai PIN-koodi oli väärin";
          default:
            return "Ei internet-yhteyttä";
        }
      })
      .catch((response) => {
        return response.message;
      });
  } catch (error) {
    return error;
  }
};

export default retrieveUserInformation;
