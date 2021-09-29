import React, { useEffect } from "react";
import { Icon } from "react-materialize";
const feedTabs = (props) => {
  const item = props.feed;
  return (
    <li key={item.id}>
      <div onClick={() => props.handleSelect(item.name,item.id)}><Icon id={item.id}>chevron_right</Icon><h5>{item.name}</h5></div>
    </li>
  );
};

export default feedTabs;
