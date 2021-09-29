const fetch = require("node-fetch");
const readline = require("readline");
const { url } = require("inspector");

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

// Setting for Events module
module.exports.setSettings = async function setUp(variables) {
  // Set default values to settings.json ?
  console.log(color.magenta("Set up events:"));
  // Set default settings
  //#region DefaultSettings
  let setOnlyDefaults = await awaitAnswer(
    "Step:1 " +
    color.yellow(
      "Set only a default values to settings.json? (You can modify settings after this program at settings.json file) (y/n)\n"
    )
  );
  if (setOnlyDefaults === "y" || setOnlyDefaults === "Y") {
    variables["showEventsCount"] = 20;
    variables["filters"] = {};
    variables["filters"]["includeFilterBar"] = true;
    variables["filters"]["includePostalCodeFilter"] = false;
    variables["filters"]["includeKeywordFilter"] = true;
    variables["filters"]["includeTextFilter"] = true;
    variables["filters"]["includeTimeFilter"] = true;
    variables["apiURL"] = "";
    variables["filters"]["includeAddressLocality"]
    variables["filters"]["locality"]
    console.log(color.blue("Default settings done...\nAdd the api url (eg. https://api.linkedevents.fi/v1/event/) to the settings file"));
    return variables;
  }
  //#endregion
  //#region CommonSettings

  let eventsCount = null;
  //   await awaitAnswer(
  //       "Step:3 " + color.yellow("How many event items will be loaded with each query (1 - 100)?:\n")
  //   )

  do {
    eventsCount = await awaitAnswer(
      "Step:2 " +
      color.yellow(
        "How many Events items are loaded from API with a single query? Input a number:\n"
      )
    );
    if (isNaN(eventsCount)) {
      console.log(color.red("Input is not a number!"));
    }
  } while (isNaN(eventsCount));
  variables["showEventsCount"] = eventsCount;

  variables["filters"] = {};
  let showFilterBar = await awaitAnswer(
    "Step:3 " +
    color.yellow(
      "Do you want to include the filter bar? (Includes different filters) (y/n):\n"
    )
  );
  if (showFilterBar === "Y" || showFilterBar === "y") {
    variables["filters"]["includeFilterBar"] = true;
  } else {
    variables["filters"]["includeFilterBar"] = false;
  }

  let includeAddressLocality = await awaitAnswer(
    "Step:4 " +
    color.yellow(
      "Does your LinkedEvents installation have a ?address_locality filter? (y/n):\n"
    )
  );
  if (includeAddressLocality === "Y" || includeAddressLocality === "y") {
    variables["filters"]["includeAddressLocality"] = true;
  } else {
    variables["filters"]["includeAddressLocality"] = false;
  }

  if (includeAddressLocality === "Y" || includeAddressLocality === "y") {
    let locality = await awaitAnswer(
      "Step:5 " +
      color.yellow(
        "Add the locality to filter by (e.g. Hämeenlinna) \n"
      )
    );
    variables["filters"]["locality"] = locality.trim()
  }

  if (showFilterBar === "Y" || showFilterBar === "y") {
    let includePostalCodeFilter = await awaitAnswer(
      color.yellow(
        "Does your Linked Events installation have a postal code filter under ?postal_code and you want to use it? (y/n):\n"
      )
    );
    if (includePostalCodeFilter === "Y" || includePostalCodeFilter === "y") {
      variables["filters"]["includePostalCodeFilter"] = true;
    } else {
      variables["filters"]["includePostalCodeFilter"] = false;
    }

    let includeKeywordFilter = await awaitAnswer(
      color.yellow("Do you want to include a keyword filter? (y/n):\n")
    );
    if (includeKeywordFilter === "Y" || includeKeywordFilter === "y") {
      variables["filters"]["includeKeywordFilter"] = true;
    } else {
      variables["filters"]["includeKeywordFilter"] = false;
    }

    let includeTextFilter = await awaitAnswer(
      color.yellow("Do you want to include a text filter? (y/n):\n")
    );
    if (includeTextFilter === "Y" || includeTextFilter === "y") {
      variables["filters"]["includeTextFilter"] = true;
    } else {
      variables["filters"]["includeTextFilter"] = false;
    }

    let includeTimeFilter = await awaitAnswer(
      color.yellow("Do you want to include time filter? (y/n):\n")
    );
    if (includeTimeFilter === "Y" || includeTimeFilter === "y") {
      variables["filters"]["includeTimeFilter"] = true;
    } else {
      variables["filters"]["includeTimeFilter"] = false;
    }
  }

  let addUrl = "";
  let pass = false;
  do {
    addUrl = await awaitAnswer(
      "Step:5 " +
      color.yellow(
        "Add the url of your API, including the path to the event endpoint (e.g. https://api.linkedevents.fi/v1/event/) \n"
      )
    );

    addUrl = addUrl.trim();
    //url = addUrl;

    let statusCode = "";
    console.log(
      color.blue(
        "Checking connection to " + addUrl + " \nthis may take some time..."
      )
    );
    await fetch(addUrl)
      .then(function (response) {
        console.log(response.status);
        statusCode = response.status;
      })
      .catch((error) => {
        console.log(color.red("ERROR OCCURRED!"));
        console.log(error);
      });
    if (statusCode === 200) {
      pass = true;
      console.log(color.green("Status OK"));
      variables["apiURL"] = addUrl;
      //console.log(feedUrl);
      console.log(
        color.green(addUrl + " response status is 200, url has been added.")
      );
    } else {
      console.error(
        color.red(
          "\n ***ERROR! CAN'T Connect to " + addUrl + " check url! *** \n"
        )
      );
    }
  } while (!pass);

  console.log(color.blue("Events settings done!"));
  return variables;

  //#endregion
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
