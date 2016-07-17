import React from "react/addons";
import {Link} from "react-router";

import config from "../config/config";

import classNames from "classnames";

import PopoverComponent from "./PopoverComponent";

import OnClickOutsideMixin from "react-onclickoutside";

import t from "../config/i18n";

var LangButtonComponent = React.createClass({
  displayName: "LangButtonComponent",

  contextTypes: {
    router: React.PropTypes.func
  },

  mixins: [OnClickOutsideMixin],

  getInitialState: function () {
    return {
      helpMenuVisible: false
    };
  },

  handleClickOutside: function () {
    this.setState({
      helpMenuVisible: false
    });
  },

  toggleLangButton: function () {
    this.setState({
      helpMenuVisible: !this.state.helpMenuVisible
    });
  },

  render: function () {
    var router = this.context.router;
    var helpMenuClassName = classNames("help-menu", {
      "active": this.state.helpMenuVisible
    });

    return (
      <div className={helpMenuClassName}
          onClick={this.toggleLangButton}>
        <i className="icon icon-mini ion-flag"></i>
        <span className="caret"></span>
        <PopoverComponent visible={this.state.helpMenuVisible}
            className="help-menu-dropdown">
          <ul className="dropdown-menu">
            <li>
              <a href={config.enUrl}>
                {t("English")}
              </a>
            </li>
            <li>
              <a href={config.faUrl}>
                {t("فارسی")}
              </a>
            </li>
          </ul>
        </PopoverComponent>
      </div>
    );
  }
});

export default LangButtonComponent;
