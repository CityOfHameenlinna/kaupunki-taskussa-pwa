import React from "react";
import { Checkbox } from "react-materialize";
import searchStyles from "../css/events/Search.module.scss";

const keywordFilter = (props) => {
  const kw = [...props.keywords];
  return (
    <>
      <h6>Kategoria</h6>
      <ul className={searchStyles.Keywords}>
        {kw.map((keyword) => (
          <Checkbox
            key={keyword.id}
            id={keyword.id}
            checked
            label={keyword.name}
            value={keyword.value}
            checked={keyword.checked}
            onChange={() => props.handleSelect(keyword.id)}
          />
        ))}
      </ul>
    </>
  );
};

export default keywordFilter;
