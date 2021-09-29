import React, { Component } from "react";
import CookieConsent, { getCookieConsentValue } from "react-cookie-consent";
import { Icon, TextInput } from "react-materialize";
import { db } from "../../dexieDB";
import mainStyles from "../css/App.module.scss";
import libraryStyles from "../css/Library.module.scss";
import { sendPageviewIfConsent, setCookies } from "../helpers/GoogleAnalytics";
import Navbar from "../js/NavBar";
import BarcodeView from "../Library/Barcode";
import retrieveUserInformation from "../Library/CardValidator";
import LibraryButton from "../UI/Button";


/**
 * Note: This library card module is made specifically for Hämeenlinna libary system 
 */
class Kirjastokortti_module extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      showLogin: false,
      showBarcode: false,
      isLoading: true,
      cardNumber: "",
      pinCode: "",
      cardOwner: "",
    };
  }

  componentDidMount() {
    this._isMounted = true;
    document.title = "Kirjastokortti";

    sendPageviewIfConsent(getCookieConsentValue());

    // Is there already cardNumber saved in storage
    db.libraryCard.get(1).then((result) => {
      if (result != null) {
        if (this._isMounted) {
          this.setState({
            cardNumber: result.cardNumber,
            cardOwner: result.cardOwner,
            showBarcode: true,
            isLoading: false,
          });
        }
      } else {
        if (this._isMounted) {
          this.setState({ showLogin: true, isLoading: false });
        }
      }
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  pinChangedHandler = (event) => {
    if (this._isMounted == true) {
      this.setState({ pinCode: event.target.value });
    }
  };

  numberChangedHandler = (event) => {
    if (this._isMounted == true) {
      this.setState({ cardNumber: event.target.value });
    }
  };

  /*
  Validate user's card number by calling validateCardnumber() in Validate.js 
  Receives result that contains ok - authentication successful - or an error message 
  */
  validateCardnumber = (event) => {
    event.preventDefault();
    try {
      if (this._isMounted == true) {
        this.setState({ showLogin: false, isLoading: true });
      }
      retrieveUserInformation(this.state.cardNumber, this.state.pinCode).then(
        (result) => {
          console.log("Raw result " + result);

          if (result.status === "ok") {
            if (this._isMounted == true) {
              this.setState({
                cardOwner: result.name,
                showBarcode: true,
                isLoading: false,
                errorMessage: null,
              });
            }

            // Store barcode so that it can be used even after restart
            db.libraryCard.put({
              id: 1,
              cardNumber: this.state.cardNumber,
              cardOwner: result.name,
            });
            //db.libraryCard.put({ id: 1, cardOwner: result.name });
          } else {
            if (this._isMounted == true) {
              this.setState({
                showLogin: true,
                isLoading: false,
                errorMessage: result,
              });
            }
            //alert("Result " + result);
          }
        }
      );
    } catch (error) {
      console.log("Error " + error);
      if (this._isMounted == true) {
        this.setState({ showLogin: true, isLoading: false });
      }
      alert(error.message);
    }
  };

  // "Log out" user by removing value of the barcode
  removeBarcode = () => {
    console.log("REMOIVING")
    if (this._isMounted == true) {
      this.setState({ showBarcode: false, isLoading: true });
    }
    try {
      db.libraryCard.delete(1);
      if (this._isMounted == true) {
        this.setState({
          cardOwner: "",
          cardNumber: "",
          showLogin: true,
          isLoading: false,
        });
      }
    } catch (error) {
      if (this._isMounted == true) {
        this.setState({ isLoading: false });
      }
      alert(error.message);
    }
  };

  render() {
    return (
      <>
        <header className={mainStyles.AppHeader}>
          <Navbar />
          <div className={mainStyles.AppHeaderImgContainer}>
            <div className={mainStyles.AppHeaderImgLibraryCard}>
              <div className={mainStyles.Layer}></div>
            </div>
            <div className={mainStyles.AppHeaderImgTitle}>
              <h1>Kirjastokortti</h1>
              {/* <span>
                Sovelluksen sähköistä kirjastokorttia voi käyttää hämeenlinnan
                kirjastoissa
              </span> */}
            </div>
          </div>
          <CookieConsent
            enableDeclineButton
            flipButtons
            buttonText="Salli evästeet"
            containerClasses={mainStyles.CookieButton}
            declineButtonText="Älä salli evästeitä"
            ariaAcceptLabel="Salli evästeet"
            ariaDeclineLabel="Älä salli evästeitä"
            onAccept={() => {
              setCookies();
            }}
          >
            Käytämme sivustolla evästeitä. Sallimalla evästeet keräämme
            anonyymejä käyttötilastoja.
          </CookieConsent>
        </header>
        <div id="App-container" className={mainStyles.AppContainer}>
          <main>
            {this.state.isLoading ? (
              <div id="loader" className={libraryStyles.Loader}>
                Ladataan...
              </div>
            ) : null}

            {this.state.showLogin ? (
              <div className={[libraryStyles.Content, "container"].join(" ")}>
                <h2 className={libraryStyles.LibraryContentTitle}>Kirjaudu</h2>
                <p className={libraryStyles.Paragraph}>
                  Sovelluksen sähköistä korttia voit käyttää Hämeenlinnan
                  kirjastoissa.
                </p>
                <p className={libraryStyles.Paragraph}>
                  <a href="https://www.vanamokirjastot.fi">
                    Vanamo-verkkokirjasto
                  </a>
                </p>
                <form
                  className={libraryStyles.LibraryForm}
                  onSubmit={this.validateCardnumber}
                >
                  <TextInput
                    id="cardNumber"
                    value={this.state.cardNumber}
                    required
                    validate
                    label="Kortin numero"
                    onChange={this.numberChangedHandler}
                  />
                  <TextInput
                    id="pinCode"
                    required
                    validate
                    password
                    label="Tunnusluku"
                    onChange={this.pinChangedHandler}
                  />

                  {this.state.errorMessage ? (
                    <p id="loginError">
                      <Icon tiny>error</Icon>
                      {this.state.errorMessage}
                    </p>
                  ) : null}

                  <LibraryButton type="submit">Kirjaudu sisään</LibraryButton>
                </form>
              </div>
            ) : null}

            {this.state.showBarcode ? (
              <div className={[libraryStyles.Content, "container"].join(" ")}>
                <h2 className={libraryStyles.LibraryContentTitle}>
                  Hei, tässä on kirjastokorttisi
                </h2>
                <p>
                  Sovelluksen sähköistä korttia voit käyttää Hämeenlinnan
                  kirjastoissa.
                </p>
                <p className={libraryStyles.Paragraph}>
                  <a href="https://www.vanamokirjastot.fi">
                    Vanamo-verkkokirjasto
                  </a>
                </p>
                <div className={libraryStyles.LibraryBarcode}>
                  <BarcodeView
                    barcodeValue={this.state.cardNumber}
                    barcodeText={this.state.cardNumber}
                  ></BarcodeView>
                </div>
                <div className={libraryStyles.LibraryButton}>
                  <LibraryButton clickHandler={this.removeBarcode}>
                    Peru sähköinen kortti
                  </LibraryButton>
                </div>
              </div>
            ) : null}
          </main>
        </div>
      </>
    );
  }
}

export default Kirjastokortti_module;
