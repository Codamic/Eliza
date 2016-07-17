import React from "react/addons";

import config from "../../config/config";

import InfoActions from "../../actions/InfoActions";
import InfoEvents from "../../events/InfoEvents";
import InfoStore from "../../stores/InfoStore";
import ModalComponent from "../ModalComponent";
import ObjectDlComponent from "../ObjectDlComponent";
import UnspecifiedNodeComponent
  from "../../components/UnspecifiedNodeComponent";

var AboutModalComponent = React.createClass({
  displayName: "AboutModalComponent",

  propTypes: {
    onDestroy: React.PropTypes.func.isRequired
  },

  getInitialState: function () {
    return {
      info: InfoStore.info
    };
  },

  componentDidMount: function () {
    InfoActions.requestInfo();
  },

  componentWillMount: function () {
    InfoStore.on(InfoEvents.CHANGE, this.onInfoChange);
  },

  componentWillUnmount: function () {
    InfoStore.removeListener(InfoEvents.CHANGE, this.onInfoChange);
  },

  destroy: function () {
    this.props.onDestroy();
  },

  getInfo: function (attr) {
    return this.state.info[attr] ||
      <UnspecifiedNodeComponent tag="span" />;
  },

  onInfoChange: function () {
    this.setState({
      info: InfoStore.info
    });
  },

  render: function () {
    var marathonConfig = this.state.info.marathon_config;
    var zookeeperConfig = this.state.info.zookeeper_config;
    var logoPath = config.rootUrl + "img/eliza.png";
    return (
      <ModalComponent onDestroy={this.props.onDestroy}
          size="lg">
        <div className="modal-header modal-header-blend">
          <h2 className="modal-title" title={`UI Version ${config.version}`}>
            <img width="160" height="27" alt="Eliza" src={logoPath} />
            <small className="text-muted" style={{"marginLeft": "1em"}}>
              Version {this.getInfo("version")}
            </small>
          </h2>
        </div>
        <div className="modal-body">
          <dl className="dl-horizontal dl-horizontal-lg">
            <dt title="frameworkId">Framework Id</dt>
            <dd>
              {this.getInfo("frameworkId")}
            </dd>
            <dt title="leader">Leader</dt>
            <dd>
              {this.getInfo("leader")}
            </dd>
          </dl>
          <h5 title="marathon_config">Marathon Config</h5>
          <ObjectDlComponent object={marathonConfig} />
          <h5 title="zookeeper_config">ZooKeeper Config</h5>
          <ObjectDlComponent object={zookeeperConfig} />
        </div>
      </ModalComponent>
    );
  }
});

export default AboutModalComponent;
