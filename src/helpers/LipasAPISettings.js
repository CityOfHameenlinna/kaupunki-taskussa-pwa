const { count } = require("console");
const fetch = require("node-fetch");
const readline = require("readline");
//Colors for console output
let color = {
  byNum: (mess, fgNum, bgNum) => {
    mess = mess || "";
    fgNum = fgNum === undefined ? 31 : fgNum;
    bgNum = bgNum === undefined ? 47 : bgNum;
    return (
      "\u001b[" +
      fgNum +
      "m" +
      "\u001b[" +
      bgNum +
      "m" +
      mess +
      "\u001b[39m\u001b[49m"
    );
  },
  //removing fgNum from end because not want to use foreground color, using 40 instead
  // black: (mess, fgNum) => color.byNum(mess, 30, fgNum),
  black: (mess, fgNum) => color.byNum(mess, 30, 40),
  red: (mess, fgNum) => color.byNum(mess, 31, 40),
  green: (mess, fgNum) => color.byNum(mess, 32, 40),
  yellow: (mess, fgNum) => color.byNum(mess, 33, 40),
  blue: (mess, fgNum) => color.byNum(mess, 34, 40),
  magenta: (mess, fgNum) => color.byNum(mess, 35, 40),
  cyan: (mess, fgNum) => color.byNum(mess, 36, 40),
  white: (mess, fgNum) => color.byNum(mess, 37, 40),
};
async function awaitAnswer(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}
module.exports.setSettings = async function setUp(variables) {
  (variables["requestUrl"] = ""),
    (variables["pageTitle"] = ""),
    (variables["settings"] = {
      cityCodes: [],
      categories: {
        catTitleHere: { typecodes: [], icon: "" },
      },
    });
  let defaultSettings = await awaitAnswer(
    "Step 1: " +
      color.yellow(
        "Set only a default values to settings.json? (You can modify settings after this program at settings.json file) (y/n) "
      )
  );
  if (defaultSettings == "y" || defaultSettings == "Y") {
    (variables["requestUrl"] =
      "PROXY/lipas.cc.jyu.fi/api/sports-places"),
      (variables["pageTitle"] = "Liikuntapaikat ja virkistyskohteet"),
      (variables["useMapBox"] = true),
      (variables["mapBoxSettings"] = {
        accessToken:
          "ACCESS_TOKEN",
        styleURL: "MAPBOX_STYLE_URL",
        startLng: 24.482,
        startLat: 60.9967,
        startZoom: 7.5,
      }),
      (variables["settings"] = {
        cityCodes: [109],
        categories: {
          "Ulkoilu ja retkeily": {
            typeCodes: [103, 301],
            icon: "hiking",
          },
          "Ulkoliikunta ja kentat": {
            typeCodes: [
              1110, 1120, 1130, 1140, 1150, 1160, 1170, 1180, 1310, 1320, 1330,
              1340, 1350, 1360, 1370, 1380,
            ],
            icon: "directions_run",
          },
          "Luonto ja virkistys": {
            typeCodes: [101, 102, 104, 106, 107, 108, 109, 110, 111, 112],
            icon: "park",
          },
          "Uimarannat ja vesiliikunta": {
            typeCodes: [3110, 3120, 3130, 3210, 3220, 3230, 3240],
            icon: "pool",
          },
        },
      }),
      (variables["dataExpireMinutes"] = 1440),
      (variables["popUpDataNotAvailable"] =
        "Valitettavasti paikasta ei ole tietoa saatavilla.");
    return variables;
  }

  requestUrlDone = false;
  do {
    let requestUrl = await awaitAnswer(
      "Step 2: " +
        color.yellow(
          "Write LipasApi request url (e.g. https://PROXY/lipas.cc.jyu.fi/api/sports-places) note: add also proxy if needed \n"
        )
    );
    requestUrl = requestUrl.trim();
    let statusCode = "";
    try {
      await fetch(requestUrl)
        .then(function (response) {
          console.log(response.status);
          statusCode = response.status;
        })
        .catch((error) => {
          console.log(color.red("ERROR OCCURRED!"));
          console.log(error);
          return Promise.reject("error");
        });
    } catch (error) {
      console.log(color.red(error));
      console.log(color.yellow("Try again..."));
    }

    if (statusCode === 200 || statusCode === 206) {
      requestUrlDone = true;
      console.log(color.green("request Url Status OK!"));
      variables["requestUrl"] = requestUrl;
    } else {
      console.log(
        color.red(
          "\n ***ERROR! CAN'T get response from " +
            requestUrl +
            ", check url! *** \n" + 
            "StatusCode: " + statusCode
        )
      );
    }
  } while (!requestUrlDone);

  let pageTitle = await awaitAnswer(
    "Step 3: " + color.yellow("Set page title: \n")
  );
  variables["pageTitle"] = pageTitle;

  let cityCode = await awaitAnswer(
    color.yellow(
      "Step 4: Add city code (https://fi.wikipedia.org/wiki/Luettelo_Suomen_kuntanumeroista) \n"
    )
  );
  variables["settings"] = {
    cityCodes: [cityCode]};
  // variables["cityCodes"] = [cityCode];
  let dataExpireMin = await awaitAnswer(
    color.yellow(
      "Step 5: Add data expire value in minutes (new data from API will be fetched after expire, else data will be fetched from database. This ensures that the API is not overloaded) : \n"
    )
  );
  variables["dataExpireMinutes"] = dataExpireMin;

  let noInformationPop = await awaitAnswer(
    color.yellow(
      "Step 6: Add notification text if place does not have a info (e.g. Sorry, no information available.) : \n"
    )
  );
  variables["popUpDataNotAvailable"] = noInformationPop;
  var addMoreTypeCodes = false;
  var addMoreCategories = false;
  var count = 0;
  let typeCodesList = [];
  let allTypeCodesList = [];
  let containerName = "containernamehere" + count;
  (variables["settings"]["categories"]={});
  do {
    containerName = await awaitAnswer(
      color.yellow(
        "Step 7.1: Add name for category/collection (e.g. Outdoor activities) \n"
      )
    );
    if (!containerName) {
      containerName = "containernamehere" + count;
    }
    let icon = await awaitAnswer(
      color.yellow(
        "Step 7.2 : Add icon (see material icons https://material-ui.com/components/material-icons/ e.g. hiking)\n"
      )
    );
    

    do {
      
      let addTypeCode = null;
      do {
        addTypeCode = await awaitAnswer(
          color.yellow(
            "Step 7.3: Add typeCode (download typeCodes xlsx file from : https://www.jyu.fi/sport/fi/yhteistyo/lipas-liikuntapaikat.fi/rajapinnat-ja-ladattavat-aineistot): \n"
          )
        );
        if (isNaN(addTypeCode)) {
          console.log(color.red("Input is not a number!"));
        }
        else
        {
          typeCodesList.push(addTypeCode);
        }
      } while (isNaN(addTypeCode));
      
      let addMoreTypes = await awaitAnswer("Step 7.4: Add more typecodes? (y/n) ");
      console.log("Added typeCodes:");
      console.log(typeCodesList);
      if (addMoreTypes == "y" || addMoreTypes == "Y") {
        addMoreTypeCodes = true;
      } else {
        addMoreTypeCodes = false;
        allTypeCodesList.push(Object.assign([],typeCodesList));
        typeCodesList.length = 0;
      }
      
    } while (addMoreTypeCodes);
    let addMoreCats = await awaitAnswer(
      "Step 7.5: Add more categories/collections? (y/n) "
    );
    if (addMoreCats == "y" || addMoreCats == "Y") {
      console.log((allTypeCodesList.length - 1) + " categories added");
      addMoreCategories = true;
    } else {
      addMoreCategories = false;
    }
    (variables["settings"]["categories"][containerName]={"typeCodes":allTypeCodesList[allTypeCodesList.length - 1],"icon":icon});
  } while (addMoreCategories);
  let showMap = await awaitAnswer(
    color.yellow(
      "Step 8: Use MapBox map? (Places will be shown on list if map is not shown) (y/n) "
    )
  );
  if (showMap == "y" || showMap == "Y") {
    variables["useMapBox"] = true;
    let accessToken = await awaitAnswer(
      color.yellow(
        "Step 8.1 give a MapBox AccessToken: "
      )
    );
    let styleUrl = await awaitAnswer(
      color.yellow(
        "Step 8.2 give a MapBox StyleUrl: "
      )
    );
    let startLng = null;
    do {
      startLng = await awaitAnswer(
        color.yellow(
          "Step 8.3 give a starting longitude (e.g. 24.482) : "
        )
      );
      if (isNaN(startLng)) {
        console.log(color.red("Input is not a number!"));
      }
    } while (isNaN(startLng));

    let startLat = null;
    do {
      startLat = await awaitAnswer(
        color.yellow(
          "Step 8.4 give a starting latitude (e.g. 60.9967) : "
        )
      );
      if (isNaN(startLat)) {
        console.log(color.red("Input is not a number!"));
      }
    } while (isNaN(startLat));

    let startZoom = null;
    do {
      startZoom = await awaitAnswer(
        color.yellow(
          "Step 8.5 give a starting Zoom (e.g. 7.5) : "
        )
      );
      if (isNaN(startZoom)) {
        console.log(color.red("Input is not a number!"));
      }
    } while (isNaN(startZoom));
    variables["mapBoxSettings"] = 
    {
      "accessToken":accessToken,
      "styleURL":styleUrl,
      "startLng":startLng,
      "startLat":startLat,
      "startZoom":startZoom
    };
  }
  else{
    variables["useMapBox"] = false;
  }

  return variables;
};
