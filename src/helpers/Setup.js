/**This console tool will generate necessary files (./src/js/PathRouter.js and ./settings.json) for the project
 * Run script in console: npm run modulenames
 */
const readline = require("readline");
const path = require("path");
const fs = require("fs");
const RssFeedSettings = require("./RssFeedSettings.js");
const EventsSettings = require("./EventsSettings.js");
const LipasAPiSettings = require("./LipasApiSettings.js");
const LibrarySettings = require("./LibrarySettings.js");
const TaskuraatiSettings = require("./TaskuraatiSettings.js");
const { settings } = require("cluster");
//joining path of directory
const directoryPath = path.join(__dirname, "../../src/modules");
console.log("Fetching directory: " + directoryPath);
// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

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
//Todo add google analytic
//Program starts
mainProgram();

async function mainProgram() {
  let itemKey = 0;
  console.log(
    color.red(
      "Be sure to save a backup of the settings.json file before proceeding, this program overwrites the settings.json file"
    )
  );
  console.log(
    color.magenta(
      "Note that all these settings will be found on settings.json after you complete configuration, all typos can be fixed there, no need to start this configuration again."
    )
  );
  let query = color.yellow("\nSelect modules and configure settings? (y/n) ");
  let ans = await awaitAnswer(query);

  if (ans === "y" || ans === "Y") {
    let settings = [];
    let variables = {};
    let variableCollections = [];
    var isDone = false;
    let askExternal = await awaitAnswer(
      color.yellow(
        "Do you want to add external pages to left navigation drawer? (y/n) "
      )
    );
    if (askExternal === "y" || askExternal === "Y") {
      do {
        let externalUrl = await awaitAnswer(
          color.yellow(
            "Give url to external page (e.g. https://waltti.fi/kaupungit/hameenlinna/):\n"
          )
        );
        variables["url"] = externalUrl.trim();
        let navBarName = await awaitAnswer(
          color.yellow(
            "Give a name, this will be displayed in the left menu/drawer (the name must not begin with a number!) :\n"
          )
        );
        variables["navBarName"] = navBarName;
        let useIframe = await awaitAnswer(
          color.yellow(
            "Use Iframe? (Note that Iframe will not work if 'X-Frame-Options' is set to 'sameorigin' on " +
            externalUrl +
            ") (y/n): "
          )
        );
        if (useIframe === "y" || useIframe === "Y") {
          variables["useIframe"] = true;
          variables["originalName"] = "Iframe_module.js";
          variables["nameForVariable"] = navBarName;
          variables["path"] = "/" + navBarName;
          variables["module"] = "Iframe_module";
          variables["name"] = navBarName;
        }
        let useMarketLink = await awaitAnswer(
          color.yellow(
            "Add market link? (market link will point to iOS or Android markets) (y/n) "
          )
        );
        if (useMarketLink === "y" || useMarketLink === "Y") {
          let marketLinkiOS = await awaitAnswer(
            color.yellow(
              "Give path to iOS marketplace (e.g. itms-apps://apps.apple.com/fi/app/waltti-mobiili/id1467878273?l=fi):\n"
            )
          );
          let marketLinkAndroid = await awaitAnswer(
            color.yellow(
              "Give path to Android marketplace  (e.g. market://details?id=waltti.com.mobiili):\n"
            )
          );
          variables["market_links"] = {
            ios_link: marketLinkiOS,
            android_link: marketLinkAndroid,
          };
        } else {
          try {
            delete variables["market_links"];
          } catch (error) {
            console.log(color.red("Can't delete market_links"));
          }
        }
        itemKey++;
        variables["key"] = itemKey;
        console.log(variables);
        variablesPush = Object.assign({}, variables);
        settings.push(variablesPush);
        variables = [];
        let askIsDone = await awaitAnswer(
          color.yellow("Add more external pages? (y/n) ")
        );
        if (askIsDone === "y" || askIsDone === "Y") {
          isDone = true;
        } else {
          isDone = false;
        }
      } while (isDone);
    } else {
    }

    //passing directoryPath and callback function
    fs.readdir(directoryPath, function (err, files) {
      console.log(
        color.green("Directory contains : " + files.length + " files")
      );
      //handling error
      if (err) {
        console.log("err: " + err);
      }
      if (!files) {
        console.log(
          "Files undefined, " + directoryPath + " does not contain modules? "
        );
      } else {
        fileCount = 0;
        //listing all files using forEach
        asyncForEach(files, async (file, index) => {
          itemKey++;
          console.log("Module " + (index + 1) + " of " + files.length);
          let originalModuleName = file;
          let nameForVariable = file.replace(/-/g, "");
          nameForVariable = nameForVariable.replace(/_/g, "");
          nameForVariable = nameForVariable.replace(".js", "");
          let fileName = file.replace(/-/g, "");
          fileName = fileName.replace(".js", "");
          fileName = fileName.split("_")[0];
          variableCollections = {
            key: itemKey,
            originalName: originalModuleName,
            nameForVariable: nameForVariable,
            path: "/" + fileName,
            name: fileName,
            navBarName: "Not included",
            url: null,
            useIframe: false,
          };
          if (originalModuleName == "Iframe_module.js" || originalModuleName=="MapBoxMap.js") {
            //skip
          } else {
            let include = await awaitAnswer(
              color.yellow("include module: " + fileName + " (y/n) ")
            );
            if (include === "y" || include === "Y") {
              let navBarName = await awaitAnswer(
                color.yellow(
                  "Give the module a name, this will be displayed in the left menu/drawer:\n"
                )
              );
              variableCollections["navBarName"] = navBarName;
              switch (originalModuleName) {
                case "RSSFeed.js":
                  settings.push(
                    await RssFeedSettings.setSettings(variableCollections)
                  );
                  break;
                case "LinkedEvents.js":
                  settings.push(
                    await EventsSettings.setSettings(variableCollections)
                  );
                  break;
                case "LipasAPI.js":
                  settings.push(
                    await LipasAPiSettings.setSettings(variableCollections)
                  );
                  break;
                case "Kirjastokortti_module.js":
                  settings.push(
                    await LibrarySettings.setSettings(variableCollections)
                  );
                  break;
                case "Taskuraati.js":
                  settings.push(
                    await TaskuraatiSettings.setSettings(variableCollections)
                  );
                  break;
                default:
                  console.log("push default values to setting");
                  settings.push(variableCollections);
              }
              console.log("Summary of settings: ");
              console.log(settings[settings.length - 1]);
            } else {
              console.log(color.red("Ignoring " + fileName));
            }
          }
          if (index + 1 == files.length) {
            //Write settings to file
            const settingsJson = { settings };
            const settingsJsonFile = JSON.stringify(settingsJson);
            //Write settings json file with parameters
            fs.writeFileSync("settings.json", settingsJsonFile, function (err) {
              if (err) throw err;
            });
            console.log(
              color.green(
                "settings.json generated, open and modify file if needed."
              )
            );
            //Generate PathRouter.js for app routes
            writePathRouterFile(settings);
            console.log(
              color.green(
                "./src/js/PathRouter.js generated, open and modify file if needed."
              )
            );
          }
        });
      }
    });
  } else {
    console.log(color.red("Settings skipped..."));
  }
}

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
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

function writePathRouterFile(settingsList) {
  let settings = [];
  settingsList.map((item, index) => {
    if (item["nameForVariable"] != null) {
      settings.push(item);
    }
  });

  //Generate PathRoute.js for app routing.
  let importSection = "";
  let routeSection = "";
  //add selected models to app router
  //TODO REMOVE SPACES FROM ROUTE PATH!
  settings.map((element, index) => {
    importSection =
      importSection +
      "\nimport " +
      element.nameForVariable +
      " from " +
      '"../modules/' +
      element.originalName +
      '";';
    routeSection =
      routeSection +
      '\n        <Route path="/' +
      element.navBarName.replace(/ /g,'-') +
      '" component={' +
      element.nameForVariable +
      "} />";

  });
  let dateNow = new Date().toISOString();
  //Generate string and write it to file
  //Note <Route path="/:id">
  //This handles route path not found error and shows default warning.
  let fileContent =
    "//Generated from Setup.js - " +
    dateNow +
    " (UTC) \n" +
    'import React from "react" ; \n' +
    "import { \n" +
    "  Switch, \n" +
    "  BrowserRouter as Router,\n" +
    "  Route,\n" +
    "  HashRouter,\n" +
    '} from "react-router-dom";\n' +
    'import App from "./App";\n' +
    'import ErrorMsg from "./PathRouteErrorMsg";' +
    importSection +
    "\n" +
    "export default function AppRouter() {\n" +
    "  return (\n" +
    "    <HashRouter>\n" +
    "      <Switch>\n" +
    '        <Route exact path="/" component={App} />' +
    routeSection +
    "\n" +
    '        <Route path="/:id">\n' +
    '          <ErrorMsg errorCode="404" msgTitle="Error" msgContent="Hupsista. Jotain meni vikaan!" msgErrorTop="Osoitetta: " msgErrorBottom="ei löydy"/>\n' +
    "        </Route>\n" +
    "      </Switch>\n" +
    "    </HashRouter>\n" +
    "  );\n" +
    "}\n";
  fs.writeFileSync("./src/js/PathRouter.js", fileContent, function (err) {
    if (err) throw err;
    console.log(color.green("PathRouter file generated"));
  });
}
