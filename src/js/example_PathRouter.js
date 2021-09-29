//Generated from Setup.js - 2021-08-09T12:47:07.816Z (UTC) 
import React from "react" ; 
import { 
  Switch, 
  BrowserRouter as Router,
  Route,
  HashRouter,
} from "react-router-dom";
import App from "./App";
import ErrorMsg from "./PathRouteErrorMsg";
import Kirjastokorttimodule from "../modules/Kirjastokortti_module.js";
import LinkedEvents from "../modules/LinkedEvents.js";
import LipasAPI from "../modules/LipasAPI.js";
import RSSFeed from "../modules/RSSFeed.js";
import Taskuraati from "../modules/Taskuraati.js";
import Tietoasovelluksestamodule from "../modules/Tietoa-sovelluksesta_module.js";
export default function AppRouter() {
  return (
    <HashRouter>
      <Switch>
        <Route exact path="/" component={App} />
        <Route path="/Kirjastokortti" component={Kirjastokorttimodule} />
        <Route path="/Tapahtumat" component={LinkedEvents} />
        <Route path="/Ulkoilu-ja-liikunta" component={LipasAPI} />
        <Route path="/Tiedotteet" component={RSSFeed} />
        <Route path="/Taskuraati" component={Taskuraati} />
        <Route path="/Tietoa-sovelluksesta" component={Tietoasovelluksestamodule} />
        <Route path="/:id">
          <ErrorMsg errorCode="404" msgTitle="Error" msgContent="Hupsista. Jotain meni vikaan!" msgErrorTop="Osoitetta: " msgErrorBottom="ei löydy"/>
        </Route>
      </Switch>
    </HashRouter>
  );
}
