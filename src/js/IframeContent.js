import React from "react";
import classes from "../css/IframeContent.module.scss";

const iframeContent = (props) => (
  <iframe
    position="absolute"
    width="82%"
    height="90%"
    frameBorder="0"
    src={props.url}
    className={classes.IframeContent}
  ></iframe>
);

export default iframeContent;
