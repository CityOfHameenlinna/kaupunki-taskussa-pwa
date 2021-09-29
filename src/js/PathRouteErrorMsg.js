import React from "react";
import mainStyles from "../css/App.module.scss";
import {Icon} from "react-materialize";
import NavBar from "../js/NavBar";
const PathRouteErrorMsg = (props) => {
  return (
    <>
      <header className={mainStyles.AppHeader}>
        <NavBar />
        <div className={mainStyles.AppHeaderImgContainer}>
          <div className={mainStyles.AppHeaderImgAbout}>
            <div className={mainStyles.Layer}></div>
          </div>
          <div className={mainStyles.AppHeaderImgTitle}>
            <h1>{props.msgTitle}</h1>
          </div>
        </div>
      </header>
      <div
        id="App-container"
        className={[mainStyles.AppContainer, "container"].join(" ")}
      >
        <main>
          <div className={mainStyles.AppContent}>
            <div className={mainStyles.AppRouteNotFoundIconContainer}>
              <Icon className={mainStyles.AppRouteNotFoundErrorIcon}>
                warning
              </Icon>
              <p> {props.errorCode}</p>
            </div>
            <p>
              <b> {props.msgContent}</b>
            </p>
            <p>
              <b>{props.msgErrorTop}</b>
              <br></br>
              {window.location.href}
              <br></br>{props.msgErrorBottom}
            </p>
          </div>
        </main>
      </div>
    </>
  );
};

export default PathRouteErrorMsg;
