// jshint esversion: 6
import _ from "lodash";

function LoadDict() {
  var lang = document.getElementsByTagName("html")[0].getAttribute("lang");
  window.i18n = require("./i18n." + lang);
  console.log("asdasda111");
  console.log(window.i18n);
}

function t(key, options = {}) {
  if (window.i18n === undefined) {
    LoadDict();
  }

  console.log(key);
  console.log(window.i18n.default);

  var str = window.i18n.default[key.toLowerCase()];

  if (str === undefined) {
    return key + "+";
  }

  _.each(options, function (x) {
    str = str.replace("${" + x + "}", options[x]);
  });

  return str;
}

export default t;
