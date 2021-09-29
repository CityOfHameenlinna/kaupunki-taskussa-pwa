import "@testing-library/jest-dom/extend-expect";
import {
  fireEvent,
  getByRole,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import { rest } from "msw";
import { setupServer } from "msw/node";
import React from "react";
import LibraryCard from "../modules/Kirjastokortti_module";

import settings from "../../settings.json";
import authData from "../Library/authentication.json"


const Dexie = require("dexie");
import { db } from "../../dexieDB"
// const indexedDB = require("fake-indexeddb");
// const IDBKeyRange = require("fake-indexeddb/lib/FDBKeyRange");

//require("fake-indexeddb/auto");

var librarySettings = function (settings) {
  let librarySettings = [];
  //This path has to bee same as settings.json rssfeed module name.
  const path = "Kirjastokortti";
  //Fetching right settings for rss feed by path name
  librarySettings.push(settings.settings.find((x) => x.name == path));
  return librarySettings;
};
let moduleSettings = librarySettings(settings);

const server = setupServer(
  rest.get(
    moduleSettings[0].proxyURL + authData.library.url,
    (req, res, ctx) => {
      console.log("XML");
      return res(ctx.status(200), ctx.xml(text));
    }
  ),
  rest.get(
    authData.library.url,
    (req, res, ctx) => {
      console.log("XML");
      return res(ctx.status(200), ctx.xml(text));
    }
  ),
  rest.get("*", (req, res, ctx) => {
    console.error(`Add request handler for ${req.url.toString()}`);
    return res(ctx.status(500), ctx.json({ error: "Add handler" }));
  })
);

const text =
  "<lib><card>" +
  "<Name>Matti meikäläinen</Name>" +
  "<Status>OK</Status>" +
  "</card></lib>";

//const db = new Dexie("ktdb");
// const db = new Dexie("ktdb", {
//   indexedDB: indexedDB,
//   IDBKeyRange: IDBKeyRange,
// });
//db.version(2).stores({ libraryCard: "id", events: "id" });

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Rendering <LibraryCard />", () => {
  test("renders <LibraryCard /> component and checks navbar items", () => {
    render(<LibraryCard />);
    settings.settings.forEach((element) => {
      expect(
        screen.getByRole("link", { name: element.navBarName })
      ).toBeInTheDocument();
    });

    const navbarItems = document.getElementById("slide-out");
    // Length of items in settings plus one from the front page link added always
    expect(within(navbarItems).getAllByRole("listitem")).toHaveLength(
      settings.settings.length + 1
    );
  });

  test("Renders front page without login details", async () => {
    render(<LibraryCard />);

    await waitForElementToBeRemoved(() => document.querySelector(".Loader"));

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /Kirjastokortti/
    );

    expect(
      screen.getByText(
        /Sovelluksen sähköistä korttia voit käyttää Hämeenlinnan kirjastoissa/i
      )
    );
    expect(screen.getByRole("textbox", { name: /Kortin numero/i }));
    expect(screen.getByLabelText(/Tunnusluku/i));
    expect(screen.getByRole("button", { name: /Kirjaudu sisään/i }));
    let cardCount = await db.libraryCard.count();
    expect(cardCount).toBe(0);
  });

  test("Renders front page with login details", async () => {
    await db.libraryCard.put({
      id: 1,
      cardNumber: "12345",
      cardOwner: "omistaja a",
    });
    render(<LibraryCard />);

    await waitForElementToBeRemoved(() => document.querySelector(".Loader"));

    expect(
      screen.getByText(
        /Sovelluksen sähköistä korttia voit käyttää Hämeenlinnan kirjastoissa/i
      )
    );

    expect(screen.getByText("12345"));
    expect(screen.getByRole("button", { name: /Peru sähköinen kortti/i }));

    let cardCount = await db.libraryCard.count();
    expect(cardCount).toBe(1);

    db.libraryCard.delete(1);
  });

  test("Renders front page and log in using UI", async () => {
    render(<LibraryCard />);
    expect(document.querySelector(".Loader")).toBeInTheDocument();

    await waitForElementToBeRemoved(() => document.querySelector(".Loader"));

    expect(
      screen.getByText(
        /Sovelluksen sähköistä korttia voit käyttää Hämeenlinnan kirjastoissa/i
      )
    );
    expect(screen.getByRole("button", { name: /Kirjaudu sisään/i }));
    let cardCountBefore = await db.libraryCard.count();
    expect(cardCountBefore).toBe(0);

    fireEvent.change(screen.getByLabelText(/Tunnusluku/i), {
      target: { value: "12345" },
    });
    fireEvent.change(screen.getByLabelText(/Kortin numero/i), {
      target: { value: "123456789" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Kirjaudu sisään/i }));

    await waitForElementToBeRemoved(() => document.querySelector(".Loader"));

    expect(screen.getByText("123456789"));
    expect(screen.getByRole("button", { name: /Peru sähköinen kortti/i }));
    let cardCountAfter = await db.libraryCard.count();
    expect(cardCountAfter).toBe(1);

    db.libraryCard.delete(1);
  });

  test("Renders front page and log out using UI", async () => {
    await db.libraryCard.put({
      id: 1,
      cardNumber: "12345",
      cardOwner: "omistaja a",
    });
    render(<LibraryCard />);

    await waitForElementToBeRemoved(() => document.querySelector(".Loader"));

    expect(
      screen.getByText(
        /Sovelluksen sähköistä korttia voit käyttää Hämeenlinnan kirjastoissa/i
      )
    );

    expect(screen.getByText("12345"));
    expect(screen.getByRole("button", { name: /Peru sähköinen kortti/i }));

    let cardCountBefore = await db.libraryCard.count();
    expect(cardCountBefore).toBe(1);

    fireEvent.click(
      screen.getByRole("button", { name: /Peru sähköinen kortti/i })
    );

    //await waitForElementToBeRemoved(() => document.querySelector(".Loader"));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Kirjaudu sisään/i })
      ).toBeInTheDocument();
    });

    expect(screen.getByRole("textbox", { name: /Kortin numero/i }));
    expect(screen.getByLabelText(/Tunnusluku/i));

    let cardCountAfter = await db.libraryCard.count();
    expect(cardCountAfter).toBe(0);

    db.libraryCard.delete(1);
  });
});
