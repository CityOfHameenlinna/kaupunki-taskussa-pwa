import "@testing-library/jest-dom/extend-expect";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import { rest } from "msw";
import { setupServer } from "msw/node";
import React from "react";

import App from "../js/App";
import settings from "../../settings.json";

describe("Rendering <App />", () => {
  // Mock matchesMedia query
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  test("renders <App /> component", () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /Hämeenlinna/
    );
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Hämeenlinna taskussa – ihan lähellä 24/7"
    );
  });

  test("renders <App /> component and checks navbar items", () => {
    render(<App />);
    settings.settings.forEach((element) => {
      expect(
        screen.getByRole("link", { name: element.navBarName })
      ).toBeInTheDocument();
    });

    const navbarItems = document.getElementById('slide-out')
    // Length of items in settings plus one from the front page link added always
    expect(within(navbarItems).getAllByRole("listitem")).toHaveLength(settings.settings.length + 1)
  });
});
