import React, { useEffect } from "react";
import { Icon, Collapsible, CollapsibleItem } from "react-materialize";
import rssStyles from "../css/rss/Rss.module.scss";
import parse, { domToReact } from "html-react-parser";

const RssFeedsList = (props) => {
  let data = [];

  var combine = props.combine;
  let settingsName = "";
  try {
    if (!combine) {
      settingsName = props.data.settingsName;
      data = [...props.data.items];
    } else {
      data = [...props.data];
    }
  } catch (error) {
    console.warn("Error at RssFeedList props data iterable! : ");
    console.warn(error);
    data = [];
  }
  
  //settings for rss feed
  const rssSettings = props.rssSettings;
  let listOfIcons = [];
  //showItemsCount param determine how many feed is shown on feeds view, this param is set in settings.json
  const showItemsCount = rssSettings.showFeedsCount;
  // format date to readable format
  const dateFormatter = (date) => {
    if (date) {
      // date = date.replace("GMT","");
      try {
        date = new Date(date);
      } catch (error) {
        console.log("Error at new date: " + error);
      }
      var dd = String(date.getDate()).padStart(2, "0");
      var mm = String(date.getMonth() + 1).padStart(2, "0"); //January is 0!
      var yyyy = date.getFullYear();
      const dateF = dd + "." + mm + "." + yyyy;
      return dateF;
    } else {
      return "";
    }
  };
  //make new simpler list for feeds if list need to be merged
  let feedsList = [];
  if (combine) {
    data.forEach((element, index) => {
      let settingsName = element["settingsName"];
      element["items"].forEach((item) => {
        item["settingsName"] = settingsName;
        feedsList.push(item);
      });
    });
  } else {
    data.forEach((element, index) => {
      element["settingsName"] = settingsName;
      feedsList.push(element);
    });
  }
  //set and get settings
  let currentItemSettings;
  function setSettings(settingsName) {
    currentItemSettings = rssSettings[settingsName];
  }
  //fetch right settings for specific feed
  function getSettings() {
    return currentItemSettings;
  }
  //sort by date
  const sortedFeedsList = feedsList
    .slice()
    .sort((a, b) => new Date(b.published) - new Date(a.published));

  // Get icon for feed, warning or info, add more if needed
  function getIcon(tag, key, settings) {
    let iconsString = "";
    let iconColor = "";
    let findObject;
    if (!settings.iconSettings.iconDefinedTags) {
      console.warn("Cant find iconDefinedTags from settings.json");
    } else {
      findObject = settings.iconSettings.iconDefinedTags.find(
        (x) => x.tagName == tag[settings.iconSettings.iconTagName]
      );
    }
    if (findObject) {
      iconsString = findObject.icon;
      iconColor = findObject.color;
    }
    if (!listOfIcons.includes(iconsString)) {
      listOfIcons.push(iconsString);
      if (iconsString === "") {
        if (settings.iconSettings.showDefaultIcon) {
          //return default icon
          return (
            <Icon
              key={key}
              style={{
                position: settings.iconSettings.iconPosition,
                display: settings.iconSettings.iconDisplayType,
                fontSize: settings.iconSettings.iconSizePx,
                color: settings.iconSettings.iconColorDefault,
                margin: settings.iconSettings.iconMargin,
                width: settings.iconSettings.iconWidth,
                textAlign: settings.iconSettings.iconTextAlign,
              }}
            >
              {settings.iconSettings.iconDefault}
            </Icon>
          );
        } else {
        }
      } else {
        return (
          <Icon
            key={key}
            style={{
              position: settings.iconSettings.iconPosition,
              display: settings.iconSettings.iconDisplayType,
              fontSize: settings.iconSettings.iconSizePx,
              margin: settings.iconSettings.iconMargin,
              width: settings.iconSettings.iconWidth,
              color: iconColor,
              textAlign: settings.iconSettings.iconTextAlign,
            }}
          >
            {iconsString}
          </Icon>
        );
      }
    } else {
      //Icon already on a list
    }
  }
  //reset icon list, this list collects used icon names so icon shows only once per feed
  function resetIconsList() {
    listOfIcons = [];
  }
  //Modify collapsible content text
  const modifyText = (text, rssSettingsName) => {
    let rssFeedSettings = getSettings(rssSettingsName);
    if (rssFeedSettings.modifyContent) {
      let modifiedText = text;
      if (rssFeedSettings.splitTextAfterCount != 0) {
        modifiedText = modifiedText.substr(
          0,
          rssFeedSettings.splitTextAfterCount
        );
      }
      if (
        rssFeedSettings.splitTextBefore != "" &&
        rssFeedSettings.splitTextBefore != "undefined"
      ) {
        modifiedText = modifiedText.split(rssFeedSettings.splitTextBefore)[0];
      }
      if (
        rssFeedSettings.splitTextAfter != "" &&
        rssFeedSettings.splitTextAfter != "undefined"
      ) {
        modifiedText = modifiedText.split(rssFeedSettings.splitTextAfter).pop();
      }
      if (rssFeedSettings.replaceWords) {
        rssFeedSettings.replaceWords.map((condition) => {
          modifiedText = modifiedText.replace(
            condition.replace,
            condition.with
          );
        });
      }
      if (
        rssFeedSettings.addEndTag &&
        rssFeedSettings.addEndTag != "" &&
        rssFeedSettings.addEndTag != "undefined"
      ) {
        modifiedText = modifiedText + rssFeedSettings.addEndTag;
      }
      if (rssFeedSettings.isContentHtmlFormat) {
        modifiedText = parse(modifiedText);
      }
      return modifiedText;
    } else {
      let modifiedText = text;
      if (rssFeedSettings.isContentHtmlFormat) {
        modifiedText = parse(modifiedText);
      }
      return modifiedText;
    }
  };
  //fetch right icon for feed
  const handleIcon = (items, index) => {
    let iconsList = [];
    let settings = getSettings();
    if (settings.iconSettings.showIcons) {
      
      if (
        items[settings.iconSettings.iconTagContainerName] &&
        items[settings.iconSettings.iconTagContainerName].length != 0
      ) {
          items[settings.iconSettings.iconTagContainerName].map(
            (tag, index) => {
              if (settings.iconSettings.showOnlyOneIcon && iconsList.length >=1) {
                //Show only one icon is true and list has a 1 already, not adding icons
              }
              else{
                iconsList.push(getIcon(tag, index, settings));
            }
          }
          );
      } else {
        if (settings.iconSettings.showOnlyOneIcon && iconsList.length >=1) {
        } else {
        iconsList.push(getIcon("", index, settings));
        }
      }
    } else {
      //return empty icon.
      return (
        <Icon key={index} style={{ display: "none" }}>
          info
        </Icon>
      );
    }
    return iconsList;
  };

  const handleLink = (items,index)=>
  {
    let settings = getSettings();
    if (settings.showLink) {
      try {
        if(Array.isArray(items[settings.linkContainer]))
        {
          return (<a href={items[settings.linkContainer][0].url}>{settings.linkDescription}</a>)
        }
        else
        {
          return (<a href={items[settings.linkContainer]}>{settings.linkDescription}</a>)
        }
      } catch (error) {
        console.log(error);
        return "";
      }
  }
}
  return (
    <div className={rssStyles.Content}>
      <Collapsible className={rssStyles.Collapsible}>
        {sortedFeedsList.slice(0, showItemsCount).map(
          (items, index) => (
            setSettings(items.settingsName),
            (
              <CollapsibleItem
                className={rssStyles.CollapsibleItem}
                key={index}
                expanded={false}
                header={
                  <div className={rssStyles.CollapsibleContentHeader}>
                    <p>
                      {dateFormatter(
                        items[getSettings().feedPublishedDateContainer]
                      )}
                    </p>
                    <h4>{items[getSettings().feedTitleContainer]}</h4>
                  </div>
                }
                icon={
                  <div className={rssStyles.CollapsibleIconContainer}>
                    {handleIcon(items, index)}
                  </div>
                }
              >
                {resetIconsList()}
                <div className={rssStyles.SubContent}>
                  {modifyText(items[getSettings().feedContentContainer])}
                  <p>
                  {handleLink(items)}
                  </p>
                </div>
              </CollapsibleItem>
            )
          )
        )}
      </Collapsible>
    </div>
  );
};

export default RssFeedsList;
