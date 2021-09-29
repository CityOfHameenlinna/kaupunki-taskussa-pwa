import React from "react";
//import renderer from 'react-test-renderer';
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
const jsdom = require("jsdom")
const {JSDOM} = jsdom;

import Tiedotteet from "../modules/RSSFeed";

let container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

test("Renders front page", () => {
  global.gtag = jest.fn();
  act(() => {
    render(<Tiedotteet />, container);
  })
  //const linkElement = container.getByText(/Etusivu/i);
  expect(container.textContent).toContain('Tiedotteet');
});
