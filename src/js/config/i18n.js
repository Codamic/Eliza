// jshint esversion: 6
import _ from "lodash";

function LoadDict() {
  var lang = document.getElementsByTagName("html")[0].getAttribute("lang");
  window.i18n = require("./i18n." + lang);
}

function t(key, options = {}) {
  if (window.i18n === undefined) {
    LoadDict();
  }

  var str = window.i18n.default[key.toLowerCase()];

  if (str === undefined) {
    return key + "+";
  }

  _.each(options, function (x, v) {
    console.log(x);
    console.log(v);
    str = str.replace("${" + v + "}", x);
  });

  return str;
}

export default t;
