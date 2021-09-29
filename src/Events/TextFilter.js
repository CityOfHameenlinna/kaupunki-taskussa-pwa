import React from "react";
import { TextInput } from "react-materialize";

const textFilter = (props) => {
  return (
    <TextInput
      id="search"
      onChange={props.handleQuery}
      label="Hae hakusanalla"
      value={props.value}
    />
  );
};

export default textFilter;
