import React, { Component } from "react";
var Barcode = require("react-barcode");

// This class returns Barcode component which receives it's value and text from it's caller
class BarcodeView extends Component {
  render() {
    return (
      <Barcode
        value={this.props.barcodeValue}
        format="CODE128"
        width={1.5}
        height={100}
        text={this.props.barcodeText}
        lineColor="#1e3250"
        background="#fff"
      />
    );
  }
}

export default BarcodeView;
