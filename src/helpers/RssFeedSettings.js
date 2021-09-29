const rssParser = require("react-native-rss-parser");
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

//Settings for RSS FEED MODULE
module.exports.setSettings = async function setUp(variables) {
  //Set default values to settings.json ?
  console.log(color.magenta("Set up rss feed:"));
  //set default settings
  //#region defaultSettingsConstructor
  variables["pageTitle"] = "Tiedotteet";
  variables["showFeedsCount"] = 20;
  variables["combineFeeds"] = false;
  //#endregion
  //#region DefaultSettings
  let setOnlyDefaults = await awaitAnswer(
    "Step:1 " +
      color.yellow(
        "Set only a default values to settings.json? (You can modify settings after this program at settings.json file) (y/n) "
      )
  );
  if (setOnlyDefaults === "y" || setOnlyDefaults === "Y") {
    variables["feedUrls"] = [
      {
        id: "url-1",
        name: "Tiedotteet",
        url: "WWW.URL.FI/FEED/",
        absoluteUrl: "HTTPS://URL.FI/FEED/",
        proxy: "HTTPS://PROXY_URL/",
      },
      {
        id: "url-2",
        name: "Häiriötiedotteet",
        url: "WWW.URL.FI/FEED/",
        absoluteUrl: "HTTPS://FEED_URL/",
        proxy: "HTTPS://PROXY_URL/",
      },
    ];
    let settings = {};
    let itemId1 =
      "HTTPS://PROXY_URL/URL.FI/FEED";
    let itemId2 =
      "HTTPS://PROXY_URL/URL.FI/FEED";
    settings["feedContentContainer"] = "description";
    settings["isContentHtmlFormat"] = true;
    settings["feedPublishedDateContainer"] = "published";
    settings["feedTitleContainer"] = "title";
    settings["linkDescription"] = "Lue lisää: ";
    settings["linkContainer"] = "id";
    settings["showLink"] = false;
    settings["modifyContent"] = true;
    settings["replaceWords"] = [{ replace: "The post", with: "Lue lisää: " }];
    settings["splitTextAfter"] = "";
    settings["splitTextBefore"] = "appeared first on";
    settings["splitTextAfterCount"] = 0;
    settings["addEndTag"] = "</p>";
    settings["showMoreLink"] = {
      href: "HTTPS://URL.FI/MORE",
      name: "Kaikki tiedotteet",
      isShowing: true,
    };
    //Icon settings
    settings["iconSettings"] = {};
    settings["iconSettings"]["showIcons"] = true;
    settings["iconSettings"]["showOnlyOneIcon"] = true;
    settings["iconSettings"]["iconTagContainerName"] = "categories";
    settings["iconSettings"]["iconTagName"] = "name";
    settings["iconSettings"]["iconDefinedTags"] = [
      { tagName: "Tiedotteet", icon: "info_outline", color: "#007bff" },
    ];

    settings["iconSettings"]["showDefaultIcon"] = true;
    settings["iconSettings"]["iconDefault"] = "info_outline";
    settings["iconSettings"]["iconColorDefault"] = "#007bff";
    settings["iconSettings"]["iconSizePx"] = "24px";
    settings["iconSettings"]["iconMargin"] = "0";
    settings["iconSettings"]["iconDisplayType"] = "inline-table";
    settings["iconSettings"]["iconPosition"] = "relative";
    settings["iconSettings"]["iconTextAlign"] = "left";
    settings["iconSettings"]["iconWidth"] = "auto";
    variables[itemId1] = {};
    variables[itemId1] = settings;
    let settings2 = Object.assign({}, settings);
    settings2["iconSettings"] = Object.assign({}, settings["iconSettings"]);
    settings2["showMoreLink"] = {
      href: "HTTPS://URL.FI/MORE",
      name: "Kaikki häiriötiedotteet",
      isShowing: true,
    };
    settings2["iconSettings"]["showOnlyOneIcon"] = true;
    settings2["iconSettings"]["iconDefinedTags"] = [
      { tagName: "Häiriötiedotteet", icon: "warning", color: "#f77952" },
    ];
    settings2["iconSettings"]["iconDefault"] = "warning";
    settings2["iconSettings"]["iconColorDefault"] = "#f77952";
    settings2["iconSettings"]["iconSizePx"] = "24px";
    settings2["iconSettings"]["iconMargin"] = "0";
    settings2["iconSettings"]["iconDisplayType"] = "inline-table";
    settings2["iconSettings"]["iconPosition"] = "relative";
    settings2["iconSettings"]["iconTextAlign"] = "left";
    settings2["iconSettings"]["iconWidth"] = "auto";
    variables[itemId2] = {};
    variables[itemId2] = settings2;
    console.log(color.blue("Default settings done..."));
    return variables;
  }
  //#endregion
  //#region CommonSettings
  let feedPageTitle = await awaitAnswer(
    "Step:2 " +
      color.yellow(
        "Title for RSS feed page (Title shows at the top of the page. e.g. News/Tiedotteet):\n"
      )
  );
  variables["pageTitle"] = feedPageTitle;
  let combineFeedsAns = await awaitAnswer(
    "Step:3 " +
      color.yellow(
        "Generate separate tabs/buttons for each feed? (answer no: will combine all feeds to one list)  (y/n) "
      )
  );
  var combineFeeds = true;
  let feedUrlNames = [];
  let proxy = "";
  let feedUrls = [];
  if (combineFeedsAns === "y" || combineFeedsAns === "Y") {
    combineFeeds = false;
  }
  let showFeedsCount = null;
  do {
    showFeedsCount = await awaitAnswer(
      "Step:4 " + color.yellow("How many RSS feed items are displayed on page? (how many post will be listed) number: ")
    );
    if (isNaN(showFeedsCount)) {
      console.log(color.red("Input is not a number!"));
    }
  } while (isNaN(showFeedsCount));

  variables["showFeedsCount"] = showFeedsCount;
  variables["combineFeeds"] = combineFeeds;
  //#endregion
  //#region ProxySettings
  var proxyDone = false;
  do {
    let proxyans = await awaitAnswer(
      "Step:5 " +
        color.yellow(
          "Do you use proxy (e.g. https://cors-anywhere.herokuapp.com/)? (y/n) "
        )
    );
    proxyans = proxyans.trim();
    if (proxyans === "y" || proxyans === "Y") {
      proxy = await awaitAnswer(
        color.yellow(
          "write proxy address (e.g. https://cors-anywhere.herokuapp.com/) \n"
        )
      );
      proxy = proxy.trim();
      let statusCode = "";
      console.log(
        color.blue(
          "Checking connection to " + proxy + " \nthis may take some time..."
        )
      );
      try {
        await fetch(proxy)
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
        console.log("Try again...");
      }

      if (statusCode === 200) {
        proxyDone = true;
        console.log(color.green("Proxy Status OK!"));
      } else {
        console.log(
          color.red(
            "\n ***ERROR! CAN'T get response from " +
              proxy +
              ", check url! *** \n"
          )
        );
      }
    } else {
      proxyDone = true;
    }
  } while (!proxyDone);
  //#endregion
  //#region FeedUrlSettings
  let feedUrl = {};
  var pass = false;
  let addUrl = "";
  let addName = "";
  let url = proxy + addUrl;
  do {
    addUrl = await awaitAnswer(
      "Step:6 " +
        color.yellow(
          "Add RSS feed absolute URL (e.g. https://www.hameenlinna.fi/tiedotteet/feed/) \n"
        )
    );
    addName = await awaitAnswer(
      color.yellow("Add name for the feed (e.g. Tiedotteet) \n")
    );
    addUrl = addUrl.trim();
    url = addUrl;
    let urlWithOutPrefix = url.replace("https://", "");
    urlWithOutPrefix = urlWithOutPrefix.replace("http://", "");
    feedUrl = {
      id: "url-1",
      name: addName,
      absoluteUrl: url,
      url: urlWithOutPrefix,
      proxy: proxy,
    };
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
      feedUrlNames.push(addName);
      feedUrls.push(feedUrl);
      variables["feedUrls"] = feedUrls;
      console.log(feedUrl);
      console.log(
        color.green(addUrl + " response status is 200, url has been added.")
      );
      variables = await setSettingsForCurrentFeed(
        variables,
        proxy + urlWithOutPrefix
      );
    } else {
      console.error(
        color.red(
          "\n ***ERROR! CAN'T Connect to " + addUrl + " check url! *** \n"
        )
      );
    }
  } while (!pass);
  var addMore = false;
  var i = 2;
  do {
    // The do while loop will always run least once before checking the condition. This will return false and break out of the loop.
    let statusCode = "";
    console.log("You have added " + feedUrls.length + " urls");
    feedUrlNames.forEach((item) => {
      console.log("\t" + item);
    });
    let addMoreUrls = await awaitAnswer(color.yellow("add more urls? (y/n) "));
    if (addMoreUrls === "y" || addMoreUrls === "Y") {
      addUrl = await awaitAnswer(
        "Step:25 " +
          color.yellow(
            "Add rss feed absolute url (e.g. https://www.hameenlinna.fi/hairiotiedotteet/feed/) \n"
          )
      );
      addUrl = addUrl.trim();
      addName = await awaitAnswer(
        color.yellow("Add name for feed tab (e.g. Häiriötiedotteet) \n")
      );
      let urlWithOutPrefix = addUrl.replace("https://", "");
      feedUrl = {
        id: "url-" + i,
        name: addName,
        absoluteUrl: addUrl,
        url: urlWithOutPrefix,
        proxy: proxy,
      };
      console.log(feedUrl);
      let ansConfirm = await awaitAnswer(
        color.yellow("Adding url, Are you sure? (y/n) ")
      );
      if (ansConfirm === "y" || ansConfirm === "Y") {
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
          feedUrlNames.push(addName);
          feedUrls.push(feedUrl);
          console.log(color.green("Url object added"));
          variables["feedUrls"] = feedUrls;

          let getPreviousSettings = await awaitAnswer(
            color.yellow(
              "Do you want to use previous settings for this feed source? (y/n) "
            )
          );
          if (getPreviousSettings === "y" || getPreviousSettings === "Y") {
            console.log("loading settings from:");
            console.log(
              variables.feedUrls[i - 2].proxy + variables.feedUrls[i - 2].url
            );
            variables[proxy + urlWithOutPrefix] =
              variables[
                variables.feedUrls[i - 2].proxy + variables.feedUrls[i - 2].url
              ];
          } else {
            variables = await setSettingsForCurrentFeed(
              variables,
              proxy + urlWithOutPrefix
            );
          }
          i++;
        }
      } else {
        console.log(color.magenta("Url not added..."));
      }
      addMore = true;
    } else {
      addMore = false;
    }
  } while (addMore);
  //#endregion
  console.log(color.blue("RSS Settings done!"));
  return variables;
};
async function setSettingsForCurrentFeed(variables, urlId) {
  console.log(color.magenta("Set feed settings for: " + urlId));
  let askDefaultSettings = await awaitAnswer(
    "Step:7 " +
      color.yellow(
        "Do you want to load default settings for this RSS feed? (You can modify settings after this program at settings.json file) (y/n) "
      )
  );
  if (askDefaultSettings === "y" || askDefaultSettings === "Y") {
    variables[urlId] = {};
    variables[urlId]["showLink"] = false;
    (variables[urlId]["showMoreLink"] = {
      href: "https://www.example.com",
      name: "Read more here",
      isShowing: false,
    }),
      (variables[urlId]["feedTitleContainer"] = "title"),
      (variables[urlId]["feedContentContainer"] = "description"),
      (variables[urlId]["feedPublishedDateContainer"] = "published"),
      (variables[urlId]["isContentHtmlFormat"] = true),
      (variables[urlId]["modifyContent"] = true),
      (variables[urlId]["replaceWords"] = [
        { replace: "Word", with: "SecondWord " },
      ]),
      (variables[urlId]["splitTextAfterCount"] = 0),
      (variables[urlId]["splitTextAfter"] = ""),
      (variables[urlId]["splitTextBefore"] = ""),
      (variables[urlId]["addEndTag"] = "</p>"),
      (variables[urlId]["iconSettings"] = {
        showIcons: false,
        showDefaultIcon: false,
        iconDefault: "chat_bubble_outline",
        iconColorDefault: "#007bff",
        showOnlyOneIcon: false,
        iconTagContainerName: "categories",
        iconTagName: "name",
        iconDefinedTags: [
          {
            tagName: "News",
            icon: "info_outline",
            color: "#f77952",
          },
          { tagName: "heart", icon: "favorite_border", color: "red" },
        ],
        iconSizePx: "14px",
        iconMargin: "0",
        iconDisplayType: "inline-table",
        iconPosition: "relative",
        iconTextAlign: "left",
        iconWidth: "auto",
      });
    return variables;
  }
  //#region SetFeedContainers
  let listOfTags = [];
  let rss;
  if (urlId.includes("http" || "https")) {
    rss = await fetchFeedRss(urlId);
  } else {
    rss = await fetchFeedRss("https://" + urlId);
  }
  console.log(rss.items[0]);
  variables[urlId] = {};
  let titleContainer = await awaitAnswer(
    "Step:8 " +
      color.yellow(
        "Look at the RSS feed above and locate Title id, Tittle content will appear in the feed header (e.g. title)\nWrite container name here: "
      )
  );
  titleContainer = titleContainer.trim();
  let contentContainer = await awaitAnswer(
    "Step:9 " +
      color.yellow(
        "Look at the RSS feed above and locate Content which will appear in the feed content (e.g. description)\nWrite container name here: "
      )
  );
  contentContainer = contentContainer.trim();
  let publishedContainer = await awaitAnswer(
    "Step:10 " +
      color.yellow(
        "Look at the RSS feed above and locate Published date which will appear in the feed (e.g. published)\nWrite container name here: "
      )
  );
  publishedContainer = publishedContainer.trim();
  let askShowLink = await awaitAnswer(
    "Step:11 " +
      color.yellow(
        "Define external url from post and show link after post content text? (usually link redirects to the original post) (y/n) "
      )
  );
  if (askShowLink === "y" || askShowLink === "Y") {
    variables[urlId]["showLink"] = true;
    let linkContainer = await awaitAnswer(
      color.yellow(
        "Look at the RSS feed above and locate link id which will appear in the feed (e.g. id/link)\nWrite container name here: "
      )
    );
    variables[urlId]["linkContainer"] = linkContainer.trim();
    let linkText = await awaitAnswer(
      color.yellow("Write link text/description (e.g. Read more): ")
    );
    variables[urlId]["linkDescription"] = linkText;
  } else {
    variables[urlId]["showLink"] = false;
  }

  let askShowGeneralLink = await awaitAnswer(
    "Step:12 " +
      color.yellow(
        "Show button after list of RSS feeds (this will redirect to external page) (y/n) "
      )
  );
  let isShowing = false;
  let btnHref = "";
  let textLinkBtn = "";
  if (askShowGeneralLink === "y" || askShowGeneralLink === "Y") {
    isShowing = true;
    btnHref = await awaitAnswer(
      color.yellow(
        "Link/href to external page (e.g. https://www.hameenlinna.fi/tiedotteet/ ):\n"
      )
    );
    btnHref = btnHref.trim();
    textLinkBtn = await awaitAnswer(
      color.yellow("Write button text/description (e.g. Read more): ")
    );
  }
  variables[urlId]["showMoreLink"] = {
    href: btnHref,
    name: textLinkBtn,
    isShowing: isShowing,
  };
  variables[urlId]["feedTitleContainer"] = titleContainer;
  variables[urlId]["feedContentContainer"] = contentContainer;
  variables[urlId]["feedPublishedDateContainer"] = publishedContainer;
  //#endregion
  //#region SetFeedSettings
  let isFeedHtml = await awaitAnswer(
    "Step:13 " + color.yellow("Is feed content html format? (y/n) ")
  );
  if (isFeedHtml === "y" || isFeedHtml === "Y") {
    variables[urlId]["isContentHtmlFormat"] = true;
  } else {
    variables[urlId]["isContentHtmlFormat"] = false;
  }
  let parseContent = await awaitAnswer(
    "Step:14 " +
      color.yellow(
        "Do you want to modify content, remove or replace certain words? Spit text after? (y/n) "
      )
  );
  if (parseContent === "y" || parseContent === "Y") {
    variables[urlId]["modifyContent"] = true;
    let replaceWords = await awaitAnswer(
      "Step:15 " +
        color.yellow(
          "Do you want to replace certain sentences, words or characters? (y/n) "
        )
    );
    if (replaceWords === "y" || replaceWords === "Y") {
      let listReplace = [];
      var addMoreWords = true;
      do {
        let replace = await awaitAnswer(color.yellow("Replace (e.g. post): "));
        let replaceWith = await awaitAnswer(
          color.yellow("with (e.g. Read more): ")
        );
        listReplace.push({ replace: replace, with: replaceWith });
        let replaceMore = await awaitAnswer(
          color.yellow("Replace more words? (y/n) ")
        );
        if (replaceMore === "y" || replaceMore == "Y") {
          addMoreWords = true;
        } else {
          variables[urlId]["replaceWords"] = listReplace;
          addMoreWords = false;
        }
      } while (addMoreWords);
    }
    let askWordsCount = await awaitAnswer(
      "Step:16 " +
        color.yellow("Do you want to split text after character count? (y/n) ")
    );
    if (askWordsCount === "y" || askWordsCount === "Y") {
      let splitAfterCount = await awaitAnswer(
        color.yellow("Split after (type 0 if don't split after): ")
      );
      variables[urlId]["splitTextAfterCount"] = splitAfterCount;
    } else {
      variables[urlId]["splitTextAfterCount"] = 0;
    }
    let splitWords = await awaitAnswer(
      "Step:17 " +
        color.yellow(
          "Do you want to split text after or before certain word or character? (y/n) "
        )
    );
    if (splitWords === "y" || splitWords === "Y") {
      let splitAfter = await awaitAnswer(
        color.yellow("Split after (leave empty if don't split after): ")
      );
      variables[urlId]["splitTextAfter"] = splitAfter;
      let splitBefore = await awaitAnswer(
        color.yellow("Split before (leave empty if don't split before): ")
      );
      variables[urlId]["splitTextBefore"] = splitBefore;
    }
    let endTag = await awaitAnswer(
      "Step:18 " +
        color.yellow(
          "If you split text after certain character count you might want to add character to the end of content text (leave empty if end text is not needed, e.g. ... ): "
        )
    );
    variables[urlId]["addEndTag"] = endTag;
  } else {
    variables[urlId]["modifyContent"] = false;
    variables[urlId]["replaceWords"] = [
      {
        replace: "",
        with: "",
      },
    ];
    variables[urlId]["splitTextAfterCount"] = 0;
    variables[urlId]["splitTextAfter"] = "";
    variables[urlId]["splitTextBefore"] = "";
    variables[urlId]["addEndTag"] = "";
  }
  //#endregion
  //#region iconSettings
  //Icon settings starts
  let showIcons = await awaitAnswer(
    "Step:19 " + color.yellow("Show icons on RSS feed view? (y/n) ")
  );
  let iconSettings = {};
  if (showIcons === "y" || showIcons === "Y") {
    console.log(
      color.blue(
        "NOTE THAT this project is using Material icons, see more icon choices https://material-ui.com/components/material-icons/"
      )
    );
    //#region DefaultIconSettings
    let showDefault = await awaitAnswer(
      "Step:20 " +
        color.yellow(
          "Do you want to show default icon for all post? this icon is displayed if tag does not match any defined tags (y/n): "
        )
    );
    if (showDefault === "y" || showDefault === "Y") {
      iconSettings["showDefaultIcon"] = true;
      let infoIconDefault = await awaitAnswer(
        color.yellow(
          "Define default icon, see material icons https://material-ui.com/components/material-icons/ (e.g. info): "
        )
      );
      let defaultColor = await awaitAnswer(
        color.yellow(
          console.log("Default color for icon (e.g. #007bff or blue etc.) : ")
        )
      );
      iconSettings["iconDefault"] = infoIconDefault;
      iconSettings["iconColorDefault"] = defaultColor;
    } else {
      iconSettings["showDefaultIcon"] = false;
      iconSettings["iconDefault"] = "info_outline";
      iconSettings["iconColorDefault"] = "#007bff";
    }
    //#endregion
    //#region show only one icon
    //#region DefaultIconSettings
    let showOne = await awaitAnswer(
      "Step:21 " +
        color.yellow(
          "Do you want to show only one icon per RSS feed? (this will only show first tag match or default icon if there is no match and default icon is set to true) (y/n): "
        )
    );
    if (showOne === "y" || showOne === "Y") {
      iconSettings["showOnlyOneIcon"] = true;
    } else {
      iconSettings["showOnlyOneIcon"] = false;
    }
    //#endregion
    let containerName = "";
    start_position_defineContainer: while (true) {
      console.log(rss.items[0]);
      containerName = await awaitAnswer(
        "Step:22 " +
          color.yellow(
            "(If you don't want to define this container, leave empty and press enter)\n" +
              "Look at the RSS feed above and locate container which define icon tags (e.g. categories)\nWrite container name here: "
          )
      );
      containerName = containerName.trim();
      iconSettings["iconTagContainerName"] = containerName;
      try {
        if (!rss.items[0][containerName]) {
          console.log(
            color.red(
              containerName + " is faulty container for icon tags, try again..."
            )
          );
          let askBreak = await awaitAnswer(
            color.red(
              "Do you want to skip this step, only default icon will work (y/n) "
            )
          );
          if (askBreak === "y" || askBreak === "Y") {
            iconSettings["iconTagContainerName"] = "categories";
            iconSettings["iconTagName"] = "name";
            break;
          }
          continue start_position_defineContainer;
        } else {
          console.log(color.blue(containerName + " list content: "));
          let listKeyValue =[];
          rss.items.map((item, index) => {
            item[containerName].map((tag)=>
            {
              listKeyValue.push(tag);
            }
            );
          });
          console.log(listKeyValue);
          console.log(
            color.blue(
              "Note that only first rss feed item tags are showing, you have to contact RSS feed administrator if you need to know all tags..."
            )
          );
          break;
        }
      } catch (error) {
        console.log(
          color.red(
            containerName + " is faulty container for icon tags, try again..."
          )
        );
        let askBreak = await awaitAnswer(
          color.red(
            "Do you want to skip this step, only default icon will work (y/n) "
          )
        );
        if (askBreak === "y" || askBreak === "Y") {
          break;
        }

        continue start_position_defineContainer;
      }
    }
    iconSettings["showIcons"] = true;
    if (containerName && containerName != "") {

      start_position_containerName: while (true) {
        let defineIconTags = await awaitAnswer(
          "Step:23 " +
            color.yellow("Define which RSS feed tags has a icon? (y/n) ")
        );
        if (defineIconTags === "y" || defineIconTags === "Y") {
          let itemName = await awaitAnswer(
            color.yellow(
              "See above RSS feed " +
                containerName +
                " and locate key identifier (key value pair) which define icon image name (usually key is a 'name')\nWrite key name here: "
            )
          );
          itemName = itemName.trim();
          let itemsList = await getAllTagsFromFeed(containerName, rss, itemName);
          if(!itemsList || typeof itemsList === 'undefined'|| typeof itemsList[0] ==='undefined')
          {
            console.log(color.red(itemName + " is not right, try again or skip this step..."));
            continue start_position_containerName;
           
          }
          iconSettings["iconTagName"] = itemName;
          var addMoreTags = true;
          console.log(
            color.yellow(
              "Add icons to tags, this app uses Materialize icons and you can find icon codes here: https://materializecss.com/icons.html"
            )
          );
          listOfTags.push(itemsList);
          let iconsList = [];
          do {
            console.log(listOfTags);
            console.log(
              color.blue(
                "Note that there might be more tags available, you have to contact RSS feed administrator if you need to know all tags..."
              )
            );
            let tagName = await awaitAnswer(
              color.yellow(
                "See above list of tags, write tag name which icon you want to define (e.g. Tiedotteet) :\n"
              )
            );
            let materializeIcon = await awaitAnswer(
              color.yellow(
                "Search https://material-ui.com/components/material-icons/ icons and define icon (e.g. warning or info_outline):\n"
              )
            );
            let iconColor = await awaitAnswer(
              color.yellow(
                "Color for this icon (e.g.#f77952 or red blue etc.):\n"
              )
            );
            let addMoreIcons = await awaitAnswer(
              color.yellow("Define more icons? (y/n) ")
            );
            iconsList.push({
              tagName: tagName,
              icon: materializeIcon,
              color: iconColor,
            });
            if (addMoreIcons === "y" || addMoreIcons === "Y") {
              addMoreTags = true;
            } else {
              iconSettings["iconDefinedTags"] = iconsList;
              console.log(iconsList);
              console.log("icons added...");
              addMoreTags = false;
            }
          } while (addMoreTags);
          break;
        } else {
          iconSettings["iconTagName"] = "name";
          // iconSettings["iconTagContainerName"] = "categories";
          iconSettings["iconDefinedTags"] = [];
          break;
        }
      }
      //#endregion
    } else {
      iconSettings["iconDefinedTags"] = [];
      //tag container name not defined
      // fill settings.json with default values
      iconSettings["iconTagName"] = "name";
    }
    let defineStyles = await awaitAnswer(
      "Step:24 " +
        color.yellow(
          "Modify icons styles? (icon size, icon position etc.) (y/n) "
        )
    );
    if (defineStyles === "y" || defineStyles === "Y") {
      // iconSettings["iconColorWarning"] = await awaitAnswer(
      //   color.yellow("Default color code for warning icon (e.g. #f77952):\n")
      // );
      // iconSettings["iconColorDefault"] = await awaitAnswer(
      //   color.yellow("Default color code for default icon (e.g. #007bff):\n")
      // );
      iconSettings["iconSizePx"] = await awaitAnswer(
        color.yellow("Icon HTML size in pixels: (e.g. 24px):\n")
      );
      iconSettings["iconMargin"] = await awaitAnswer(
        color.yellow("icon HTML margin (e.g. -22px 0px 0px -22px):\n")
      );
      iconSettings["iconDisplayType"] = await awaitAnswer(
        color.yellow("HTML display setting (e.g. inline-table):\n")
      );
      iconSettings["iconPosition"] = await awaitAnswer(
        color.yellow("HTML position (e.g. absolute):\n")
      );
      iconSettings["iconTextAlign"] = await awaitAnswer(
        color.yellow("HTML Text align (e.g. left):\n")
      );
      iconSettings["iconWidth"] = await awaitAnswer(
        color.yellow("HTML width (e.g. auto, 10%):\n")
      );
    } else {
      iconSettings["iconColorDefault"] = "#007bff";
      iconSettings["iconSizePx"] = "24px";
      iconSettings["iconMargin"] = "0";
      iconSettings["iconDisplayType"] = "inline-table";
      iconSettings["iconPosition"] = "relative";
      iconSettings["iconTextAlign"] = "left";
      iconSettings["iconWidth"] = "auto";
    }
  } else {
    //show icon false
    //Set defaults for easier modification for later
    iconSettings["showIcons"] = false;
    iconSettings["iconTagContainerName"] = "categories";
    iconSettings["iconTagName"] = "name";
    iconSettings["iconDefinedTags"] = [
      {
        tagName: "Tiedotteet",
        icon: "info_outline",
        color: "#007bff",
      },
    ];
    iconSettings["showDefaultIcon"] = false;
    iconSettings["iconDefault"] = "info_outline";
    iconSettings["iconColorDefault"] = "#007bff";
    iconSettings["iconSizePx"] = "24px";
    iconSettings["iconMargin"] = "0";
    iconSettings["iconDisplayType"] = "inline-table";
    iconSettings["iconPosition"] = "relative";
    iconSettings["iconTextAlign"] = "left";
    iconSettings["iconWidth"] = "auto";
    iconSettings["showOnlyOneIcon"] = false;
  }

  //#endregion iconSettings

  //TODO change content h1 h2 h3 p etc. size?
  variables[urlId]["iconSettings"] = iconSettings;
  return variables;
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

async function fetchFeedRss(url) {
  let rss = await fetch(url)
    .then((response) => response.text())
    .then((responseData) => rssParser.parse(responseData))
    .then((rss) => {
      console.log("fetch done");
      return rss;
    })
    .catch((error) => {
      console.error("FETCH ERROR OCCURRED!");
      console.error(error);
      process.exit();
    });
  // console.log("Fetch feed returns items list: ");
  // console.log(itemsList);
  console.log("return rss");
  return rss;
}
async function getAllTagsFromFeed(containerName, feedItems, itemName) {
  let listOfTags = [];
  feedItems.items.forEach((item, index) => {
    item[containerName].forEach((tag, index) => {
      if (!listOfTags.includes(tag[itemName])) {
        listOfTags.push(tag[itemName]);
      }
    });
  });
  return listOfTags;
}
