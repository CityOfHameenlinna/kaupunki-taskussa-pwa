//import { cy } from "date-fns/locale";
import settings from "../../../settings.json";

describe("Open front page and test navigation changes the URL on app modules", () => {
  before(() => {
    cy.visit("http://localhost:9000/#/");
  });

  afterEach(() => {
    cy.contains("Etusivu").click();
  });

  it("/Kirjastokortti", () => {
    cy.contains("Kirjastokortti").click();

    cy.url().should("include", "/Kirjastokortti");
  });

  it("/Tapahtumat", () => {
    cy.contains("Tapahtumat").click();

    cy.url().should("include", "/LinkedEvents");
  });

  it("/Tietoa sovelluksesta", () => {
    cy.contains("Tietoa sovelluksesta").click();

    cy.url().should("include", "/Tietoasovelluksesta");
  });

  it("/RSSFeed", () => {
    cy.contains("Tiedotteet").click();

    cy.url().should("include", "/RSSFeed");
  });
});

describe("Open front page and test navigation changes the URL on external links", () => {
  before(() => {
    cy.visit("http://localhost:9000/#/");
  });

//   afterEach(() => {
//     cy.visit("http://localhost:9000/#/");
//   });

  it("Check external URLs", () => {
      settings.settings.forEach((element) => {
          //cy.contains(element.navBarName).click();
          //cy.url().should("include", element.url);
          if (element.url !== null) {
              cy.contains("a", element.navBarName).should("have.attr", "href", element.url)
          }
      })
    // let setting = settings.settings.find((x) => x.navBarName == "Taskuraati");
    // cy.contains("a", "Taskuraati").should("have.attr", "href", setting.url)
  })
});
