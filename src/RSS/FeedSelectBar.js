import React, { useEffect } from "react";
import { Card, TextInput, Checkbox } from "react-materialize";
import searchStyles from "../css/rss/Rss.module.scss";
import FeedTabs from  "../RSS/FeedTabs";

const selectFeedBar = (props) => {

  return (
    <div className={searchStyles.FeedTabsContainer}>
    <ul>
      {[...props.feedUrls].map((item) => (
        <FeedTabs key={item.id} feed= {item} handleSelect={props.handleSelect}></FeedTabs>
      ))}
    </ul>
    </div>
  );
};

export default selectFeedBar;