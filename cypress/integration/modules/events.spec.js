import settings from "../../../settings.json";
import Dexie from "dexie";

describe("Library card", () => {
  let setting = settings.settings.find((x) => x.navBarName == "Tapahtumat");

  beforeEach(() => {
    cy.visit("http://localhost:9000/");

    let db = new Dexie("ktdb");
    db.version(3).stores({ libraryCard: "id", events: "id" , feeds:"id",mapData:"id",mapPlaceListData:"id" });
    db.libraryCard.delete(1);
  });

  it("Visit library card page of the application", () => {
    cy.contains("Tapahtumat").click();
    //cy.visit(`http://localhost:9000/#${setting.path}`);
    cy.url().should("include", "/LinkedEvents");
  });

  it("Wrong login details", () => {
    cy.contains("Tapahtumat").click();
    cy.url().should("include", "/LinkedEvents");
    
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
    cy.get("#loader", { timeout: 2000 }).should("be.visible");
    cy.get("#loginError", { timeout: 2000 }).should("be.visible");
  });

  it("Correct login details and log out", () => {
    // Login info is test id
    cy.contains("Kirjastokortti").click();
    cy.url().should("include", "/Kirjastokortti");

    cy.get("input[id=cardNumber]").should("be.visible").click({ force: true }).type("109A000XXXXX");
    cy.get("input[id=pinCode]").should("be.visible").click({ force: true }).type("1310");
    cy.get("button").contains("Kirjaudu sisään").click();
    cy.get("#loader", { timeout: 2000 }).should("be.visible");
    cy.contains("109A000XXXXX").should("be.visible");

    cy.contains("Peru sähköinen kortti").should("be.visible").click();

    cy.get("input[id=cardNumber]").should("be.visible");
    cy.get("input[id=pinCode]").should("be.visible");
  });

  it("Network error", () => {
    // Login info is test id
    cy.contains("Kirjastokortti").click();
    cy.url().should("include", "/Kirjastokortti");
    
    cy.get("input[id=cardNumber]").should("be.visible").click({ force: true }).type("109A000XXXXX");
    cy.get("input[id=pinCode]").should("be.visible").click({ force: true }).type("1310");
    cy.get("button").contains("Kirjaudu sisään").click();

    cy.intercept('GET', 'activities/*', [])

    cy.get("#loader", { timeout: 2000 }).should("be.visible");
    cy.contains("109A000XXXXX").should("be.visible");

    cy.contains("Peru sähköinen kortti").should("be.visible").click();

    cy.get("input[id=cardNumber]").should("be.visible");
    cy.get("input[id=pinCode]").should("be.visible");
  });
});


cy.intercept('GET', 'activities/*', { fixture: 'activities.json' })