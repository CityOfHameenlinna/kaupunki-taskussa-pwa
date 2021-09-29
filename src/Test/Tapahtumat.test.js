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

import Events from "../modules/LinkedEvents";

import eventsSettings from "../../settings.json";

let setting = eventsSettings.settings.find((x) => x.name == "LinkedEvents");

const server = setupServer(
  rest.get(setting.apiURL, (req, res, ctx) => {
    if (req.url.searchParams.get("page")) {
      return res(
        ctx.status(200),
        ctx.json({ meta: eventDataNext.meta, data: eventDataNext.data })
      );
    } else if (
      req.url.searchParams.get("keyword") ||
      req.url.searchParams.get("text")
    ) {
      return res(
        ctx.status(200),
        ctx.json({ meta: eventDataFiltered.meta, data: eventDataFiltered.data })
      );
    } else {
      return res(
        ctx.status(200),
        ctx.json({ meta: eventData.meta, data: eventData.data })
      );
    }
  }),
  rest.get("*", (req, res, ctx) => {
    console.error(`Add request handler for ${req.url.toString()}`);
    return res(ctx.status(500), ctx.json({ error: "Add handler" }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const today = new Date();

const eventData = {
  meta: { count: 2, next: "https://api.hameevents.fi/v1/event/?page=2" },
  //meta: { count: 1, next: null },
  data: [
    {
      accessible: true,
      audience: [{ id: "https://api.hameevents.fi/v1/keyword/yso:p5131/" }],
      description: {
        fi: "Kuvaus tapahtumalle pitkä",
        en: "Long description for event",
      },
      end_time: today,
      external_links: [
        { name: "external_link", link: "https://linkki.fi/", language: "fi" },
      ],
      id: "abcdefghij",
      images: [{ url: "https://www.hameevents.fi/images/img.jpg" }],
      in_language: [{ id: "https://api.linkki.fi/v1/language/fi" }],
      info_url: { fi: "https://linkki.fi/koti", en: "https://linkki.fi/home" },
      keywords: [{ id: "https://api.hameevents.fi/v1/keyword/yso:p5121/" }],
      location: {
        name: { fi: "Nimi paikalle" },
        street_address: { fi: "Katuosoite 1" },
        address_locality: { fi: "Kaupunki" },
      },
      location_extra_info: null,
      multi_day: false,
      name: { fi: "Tapahtuman nimi 1", en: "Event name 1" },
      short_description: {
        fi: "Lyhyt kuvaus tapahtumalle 1",
        en: "Short description for event",
      },
      start_time: today,
    },
    {
      accessible: true,
      audience: [{ id: "https://api.hameevents.fi/v1/keyword/yso:p5131/" }],
      description: {
        fi: "Kuvaus tapahtumalle pitkä",
        en: "Long description for event",
      },
      end_time: "2020-01-01T00:00:00Z",
      external_links: [
        { name: "external_link", link: "https://linkki.fi/", language: "fi" },
      ],
      id: "abcdefghi1",
      images: [{ url: "https://www.hameevents.fi/images/img.jpg" }],
      in_language: [{ id: "https://api.linkki.fi/v1/language/fi" }],
      info_url: null,
      keywords: [{ id: "https://api.hameevents.fi/v1/keyword/yso:p5121/" }],
      location: {
        name: { fi: "Nimi paikalle" },
        street_address: { fi: "Katuosoite 1" },
        address_locality: { fi: "Kaupunki" },
      },
      location_extra_info: null,
      multi_day: false,
      name: { fi: "Tapahtuman nimi 2", en: "Event name" },
      short_description: {
        fi: "Lyhyt kuvaus tapahtumalle 2",
        en: "Short description for event",
      },
      start_time: "2020-01-01T09:00:00Z",
    },
  ],
};

const eventDataEmpty = {
  meta: { count: 0, next: null },
  data: [],
};

const eventDataFiltered = {
  meta: { count: 1, next: null },
  //meta: { count: 1, next: null },
  data: [
    {
      accessible: true,
      audience: [{ id: "https://api.hameevents.fi/v1/keyword/yso:p5131/" }],
      description: {
        fi: "Kuvaus tapahtumalle pitkä",
        en: "Long description for event",
      },
      end_time: "2020-12-22T15:00:00Z",
      external_links: [
        { name: "external_link", link: "https://linkki.fi/", language: "fi" },
      ],
      id: "abcdefghij",
      images: [{ url: "https://www.hameevents.fi/images/img.jpg" }],
      in_language: [{ id: "https://api.linkki.fi/v1/language/fi" }],
      info_url: { fi: "https://linkki.fi/koti", en: "https://linkki.fi/home" },
      keywords: [{ id: "https://api.hameevents.fi/v1/keyword/yso:p5121/" }],
      location: {
        name: { fi: "Nimi paikalle" },
        street_address: { fi: "Katuosoite 1" },
        address_locality: { fi: "Kaupunki" },
      },
      location_extra_info: null,
      multi_day: false,
      name: { fi: "Tapahtuman nimi 1", en: "Event name 1" },
      short_description: {
        fi: "Lyhyt kuvaus tapahtumalle",
        en: "Short description for event",
      },
      start_time: "2020-12-22T09:00:00Z",
    },
  ],
};

const eventDataNext = {
  meta: { count: 1, next: null },
  //meta: { count: 1, next: null },
  data: [
    {
      accessible: true,
      audience: [{ id: "https://api.hameevents.fi/v1/keyword/yso:p5131/" }],
      description: {
        fi: "Kuvaus tapahtumalle pitkä 3",
        en: "Long description for event 3",
      },
      end_time: "2020-12-22T15:00:00Z",
      external_links: [
        { name: "external_link", link: "https://linkki.fi/", language: "fi" },
      ],
      id: "1234567",
      images: [{ url: "https://www.hameevents.fi/images/img.jpg" }],
      in_language: [{ id: "https://api.linkki.fi/v1/language/fi" }],
      info_url: { fi: "https://linkki.fi/koti", en: "https://linkki.fi/home" },
      keywords: [{ id: "https://api.hameevents.fi/v1/keyword/yso:p5131/" }],
      location: {
        name: { fi: "Nimi paikalle" },
        street_address: { fi: "Katuosoite 1" },
        address_locality: { fi: "Kaupunki" },
      },
      location_extra_info: null,
      multi_day: false,
      name: { fi: "Tapahtuman nimi 3", en: "Event name 3" },
      short_description: {
        fi: "Lyhyt kuvaus tapahtumalle 3",
        en: "Short description for event 3",
      },
      start_time: "2020-12-22T09:00:00Z",
    },
  ],
};

const kwords = [
  {
    id: "keyword-1",
    name: "Musiikki",
    value: "yso:p1808",
    checked: false,
  },
  {
    id: "keyword-2",
    name: "Urheilu",
    value: "yso:p965,yso:p916",
    checked: false,
  },
];

const locs = [
  {
    id: "location-1",
    name: "Paikka 1",
    value: "00000,00001",
    checked: false,
  },
  {
    id: "location-2",
    name: "Paikka 2",
    value: "10000,11000,11100",
    checked: false,
  },
];

import FilterBar from "../Events/FilterBar";
import TextFilter from "../Events/TextFilter";
import KeywordFilter from "../Events/KeywordFilter";
import LocationFilter from "../Events/LocationFilter";
import DateFilter from "../Events/DateFilter";
import EventList from "../Events/EventList";

describe("Rendering <FilterBar /> and the child components", () => {
  test("renders <FilterBar /> component", () => {
    render(<FilterBar />);
    expect(screen.getByText("Hae tapahtumia"));
  });

  test("renders <TextFilter /> component", () => {
    render(<TextFilter />);
    expect(screen.getByLabelText("Hae hakusanalla"));
  });

  test("renders <KeywordFilter /> component", () => {
    render(<KeywordFilter keywords={kwords} />);
    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
  });

  test("renders <LocationFilter /> component", () => {
    render(<LocationFilter locations={locs} />);
    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
  });

  test("renders <DateFilter /> component", () => {
    render(<DateFilter />);
    expect(screen.getByLabelText("Valitse aloituspäivä"));
    expect(screen.getByLabelText("Valitse lopetuspäivä"));
  });
});

describe("Rendering <EventList />", () => {
  test("renders <EventList /> component with event data", () => {
    render(<EventList data={eventData} />);
    expect(screen.getAllByRole("article")).toHaveLength(2);
    expect(screen.getByText("Tapahtuman nimi 1"));
    expect(screen.getByText("Tapahtuman nimi 2"));
  });

  test("renders <EventList /> component with empty event data", () => {
    render(<EventList data={eventDataEmpty} />);
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
    expect(screen.getByText("Ei tapahtumia hakuehdoilla"));
  });
});

describe("Render complete events page", () => {
  test("renders <Events /> component and checks navbar items", () => {
    render(<Events />);
    eventsSettings.settings.forEach((element) => {
      expect(
        screen.getByRole("link", { name: element.navBarName })
      ).toBeInTheDocument();
    });

    const navbarItems = document.getElementById('slide-out')
    // Length of items in settings plus one from the front page link added always
    expect(within(navbarItems).getAllByRole("listitem")).toHaveLength(eventsSettings.settings.length +  1)
  });

  test("Render events page and check content of all events and events today", async () => {
    //global.gtag = jest.fn()
    render(<Events />);

    // Wait for loading to end
    await waitFor(() => screen.getAllByRole("article"));

    expect(screen.getAllByRole("checkbox")).toHaveLength(15);
    expect(screen.getByText("Tänään tapahtuu")).toBeVisible();
    expect(screen.getByText("Kaikki tapahtumat")).toBeVisible();

    expect(screen.getAllByRole("article")).toHaveLength(2);

    // Event is found in Today and All events
    expect(screen.getAllByText("Tapahtuman nimi 1")).toHaveLength(2);
    expect(screen.getByText("Tapahtuman nimi 2")).toBeVisible();
    expect(screen.getByRole("button", { name: /Lataa lisää/i })).toBeVisible();

    fireEvent.click(screen.getByText("Tänään tapahtuu"));
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.getByText("Tapahtuman nimi 2")).not.toBeVisible();
    expect(screen.queryByText("Lataa lisää")).not.toBeVisible();

    //screen.debug(null, 20000)
  });

  test("Render events page, load next results and filter events after that", async () => {
    render(<Events />);

    // Wait for loading to end
    await waitFor(() => screen.getAllByRole("article"));

    expect(screen.getAllByRole("checkbox")).toHaveLength(15);
    expect(screen.getByText("Tänään tapahtuu")).toBeVisible();
    expect(screen.getByText("Kaikki tapahtumat")).toBeVisible();

    expect(screen.getAllByRole("article")).toHaveLength(2);

    // Event is found in Today and All events
    expect(screen.getAllByText("Tapahtuman nimi 1")).toHaveLength(2);
    expect(screen.getByText("Tapahtuman nimi 2")).toBeVisible();
    expect(screen.getByRole("button", { name: /Lataa lisää/i })).toBeVisible();

    fireEvent.click(screen.getByText("Lataa lisää"));

    await waitForElementToBeRemoved(() =>
      document.querySelector(".preloader-wrapper")
    );

    const loadMoreButton = screen.queryByText("Lataa lisää");
    expect(loadMoreButton).not.toBeInTheDocument();
    //await waitFor(() => screen.getByRole("button", { name: /Lataa lisää/i }));

    expect(screen.getAllByRole("article")).toHaveLength(3);

    expect(screen.getAllByText(/Tapahtuman nimi 1/i)).toHaveLength(2);
    expect(screen.getAllByText(/Tapahtuman nimi 2/i)).toHaveLength(1);
    expect(screen.getAllByText(/Tapahtuman nimi 3/i)).toHaveLength(1);

    fireEvent.click(screen.getByLabelText("Näyttelyt"));
    fireEvent.click(screen.getByText("Hae"));

    await waitForElementToBeRemoved(() =>
      document.querySelector(".preloader-wrapper")
    );

    expect(screen.getByText("Tänään tapahtuu"));
    expect(screen.getByText("Kaikki tapahtumat"));

    expect(screen.getAllByRole("article")).toHaveLength(1);

    expect(screen.getByText("Tapahtuman nimi 1")).toBeVisible();

    expect(loadMoreButton).not.toBeInTheDocument();
  });
});
