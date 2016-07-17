import "babel-polyfill";
import React from "react/addons";
import Router, {Redirect, Route, NotFoundRoute} from "react-router";
import AppPageComponent from "./components/AppPageComponent";
import PageNotFoundComponent from "./components/PageNotFoundComponent";
import TabPanesComponent from "./components/TabPanesComponent";
import Eliza from "./components/Eliza";
import t from "./config/i18n";

var routes = (
  <Route name="home" path="/" handler={Eliza}>
    <Route name="apps" path="apps" handler={TabPanesComponent} />
    <Route name="group" path="group/:groupId" handler={TabPanesComponent} />
    <Route name="app" path="apps/:appId" handler={AppPageComponent} />
    <Route name="appView" path="apps/:appId/:view" handler={AppPageComponent} />
    <Route name="volumeView" path="apps/:appId/volume/:volumeId"
      handler={AppPageComponent} />
    <Route name="taskView" path="apps/:appId/:view/:tab"
      handler={AppPageComponent} />
    <Route name="deployments" path="deployments" handler={TabPanesComponent} />
    <Redirect from="/" to="apps" />
    <NotFoundRoute name="404" handler={PageNotFoundComponent} />
  </Route>
);

Router.run(routes, function (Handler, state) {
  React.render(
    <Handler state={state} />,
    document.getElementById("eliza")
  );
});
