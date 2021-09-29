import settings from "../../../settings.json";
import Dexie from "dexie";

describe("Library card", () => {
  var librarySettings = function (settings) {
    let librarySettings = [];
    //This path has to bee same as settings.json rssfeed module name.
    const path = "Kirjastokortti";
    //Fetching right settings for rss feed by path name
    librarySettings.push(settings.settings.find((x) => x.name == path));
    return librarySettings;
  };
  let moduleSettings = librarySettings(settings);

  beforeEach(() => {
    cy.visit("http://localhost:9000/");

    let db = new Dexie("ktdb");
    db.version(3).stores({ libraryCard: "id", events: "id" , feeds:"id",mapData:"id",mapPlaceListData:"id" });
    db.libraryCard.delete(1);
  });

  it("Visit library card page of the application", () => {
    cy.contains("Kirjastokortti").click();
    //cy.visit(`http://localhost:9000/#${setting.path}`);
    cy.url().should("include", "/Kirjastokortti");
  });

  it("Wrong login details", () => {
    cy.contains("Kirjastokortti").click();
    cy.url().should("include", "/Kirjastokortti");

    // cy.get('input[id=cardNumber]').type('jane.lae')
    cy.get("input[id=cardNumber]")
      .should("be.visible")
      .click({ force: true })
      .type("kortinnumero1234");
    cy.get("input[id=pinCode]")
      .should("be.visible")
      .click({ force: true })
      .type("salasana1234");
    cy.contains("Kirjaudu sisään").should("be.visible").click();
    cy.get("#loader", { timeout: 10000 }).should("be.visible");
    cy.get("#loginError", { timeout: 10000 }).should("be.visible");
  });

  it("Correct login details and log out", () => {
    // Login info is test id
    cy.contains("Kirjastokortti").click();
    cy.url().should("include", "/Kirjastokortti");

    cy.get("input[id=cardNumber]").should("be.visible").click({ force: true }).type("109A000XXXXX");
    cy.get("input[id=pinCode]").should("be.visible").click({ force: true }).type("1310");
    cy.get("button").contains("Kirjaudu sisään").click();
    cy.get("#loader", { timeout: 10000 }).should("be.visible");
    cy.contains("109A000XXXXX").should("be.visible");

    cy.contains("Peru sähköinen kortti").should("be.visible").click();

    cy.get("input[id=cardNumber]").should("be.visible");
    cy.get("input[id=pinCode]").should("be.visible");
  });

  it("Network error", () => {
      cy.intercept('POST', moduleSettings[0].proxyURL + '*', [])

    // Login info is test card
    cy.contains("Kirjastokortti").click();
    cy.url().should("include", "/Kirjastokortti");
    
    cy.get("input[id=cardNumber]").should("be.visible").click({ force: true }).type("109A000XXXXX");
    cy.get("input[id=pinCode]").should("be.visible").click({ force: true }).type("1310");
    cy.get("button").contains("Kirjaudu sisään").click();


    cy.get("#loader", { timeout: 10000 }).should("be.visible");
    cy.contains("109A000XXXXX").should("be.visible");

    cy.contains("Peru sähköinen kortti").should("be.visible").click();

    cy.get("input[id=cardNumber]").should("be.visible");
    cy.get("input[id=pinCode]").should("be.visible");
  });
});
