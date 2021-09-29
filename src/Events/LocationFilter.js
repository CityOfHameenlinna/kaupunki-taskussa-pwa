import React from "react";
import { Checkbox } from "react-materialize";
import searchStyles from "../css/events/Search.module.scss";

const locationFilter = (props) => {
  const locations = [...props.locations];
  return (
    <>
      <h6>Sijainti</h6>
      <ul className={searchStyles.Locations}>
        {locations.map((location) => (
          <Checkbox
            key={location.id}
            id={location.id}
            checked
            label={location.name}
            value={location.value}
            checked={location.checked}
            onChange={() => props.handleLocationSelect(location.id)}
          />
        ))}
      </ul>
    </>
  );
};

export default locationFilter;
