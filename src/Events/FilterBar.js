import React from "react";
import { Collapsible, CollapsibleItem, Icon } from "react-materialize";
import FilterBarStyles from "../css/events/Events.module.scss";

const searchBar = (props) => {
  return (
    <Collapsible className={FilterBarStyles.FilterBar} accordion={false}>
      <CollapsibleItem
        className={FilterBarStyles.FilterBarCollapsibleItem}
        expanded={false}
        header="Hae tapahtumia"
        //icon={<Icon>search</Icon>}
        icon={<Icon>expand_more</Icon>}
        node="div"
      >
        {props.children}
      </CollapsibleItem>
    </Collapsible>
  );
};

export default searchBar;
