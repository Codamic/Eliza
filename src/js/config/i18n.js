// jshint esversion: 6
import _ from "lodash";

class I18n {
  constructor() {
    this.lang = document.getElementsByTagName("html")[0].getAttribute("lang");
    this.dict = require("./i18n." + this.lang);
  }

  t(key, options = {}) {
    console.log(key);
    console.log(this.dict.default);

    var str = this.dict.default[key];

    if (str === undefined) {
      return key + "+";
    }

    _.each(options, function (x) {
      str = str.replace("${" + x + "}", options[x]);
    });
    return str;
  }
}

export default new I18n();
