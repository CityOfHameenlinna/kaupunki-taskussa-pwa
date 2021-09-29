import React, { useState } from 'react';
import { Icon } from "react-materialize";
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import Class from '../css/App.module.scss';

const ControlledPopup = (props) => {
  let Title = props.title;
  let Content = props.content;
  let IconStyle = props.iconStyle;
  let ButtonText = props.buttonText;
  const [open, setOpen] = useState(true);
  const closeModal = () => setOpen(false);

  return (
    <Popup open={open} nested>
      <Icon onClick={closeModal}>close</Icon>
      <div className={Class.PopUp}>
        <div className={Class.PopUpIcon}>
          <Icon className={Class.PopUpWarningIcon}>
            {IconStyle}
          </Icon>
        </div>
        <div className={Class.PopUpContent}>
          <h1>{Title}</h1>
          <p>{Content}</p>
          <button className={Class.PopUpButton} onClick={closeModal}>{ButtonText}</button>
        </div>
      </div>
    </Popup>
  );
};

export default ControlledPopup;
