import classNames from "classnames";
import React from "react/addons";

import ContainerConstants from "../constants/ContainerConstants";
import DuplicableRowControls from "../components/DuplicableRowControls";
import DuplicableRowsMixin from "../mixins/DuplicableRowsMixin";
import FormActions from "../actions/FormActions";
import FormGroupComponent from "../components/FormGroupComponent";
import PortInputAttributes from "../constants/PortInputAttributes";
import TooltipComponent from "../components/TooltipComponent";
import ExternalLinks from "../constants/ExternalLinks";

import Util from "../helpers/Util";

import t from "../config/i18n";

const fieldsetId = "portDefinitions";

function isTooComplexStructure(fields, hasVIP = false) {
  return fields.portDefinitions != null &&
      fields.portDefinitions.some(portDefinition => {
        if (!hasVIP && portDefinition.vip != null) {
          return true;
        }

        if (portDefinition.labels != null) {
          let labels = Object.assign({}, portDefinition.labels);
          if (hasVIP) {
            delete labels["VIP_0"];
          }
          return !!Object.keys(labels).length;
        }
        return false;
      }
    );
}

var OptionalPortsAndServiceDiscoveryComponent = React.createClass({
  displayName: "OptionalPortsAndServiceDiscoveryComponent",

  mixins: [DuplicableRowsMixin],

  duplicableRowsScheme: {
    portDefinitions: {
      port: null,
      protocol: ContainerConstants.PORTMAPPINGS.PROTOCOL.TCP,
      name: null,
      labels: null,
      vip: null
    }
  },

  propTypes: {
    containerType: React.PropTypes.string.isRequired,
    fields: React.PropTypes.object.isRequired,
    getErrorMessage: React.PropTypes.func.isRequired,
    handleModeToggle: React.PropTypes.func.isRequired,
    hasVIP: React.PropTypes.bool
  },

  getDefaultProps: function () {
    return {
      containerType: ContainerConstants.TYPE.MESOS,
      hasVIP: false
    };
  },

  handleAddRow: function (fieldId, position, event) {
    event.target.blur();
    event.preventDefault();

    var scheme = Util.extendObject(this.duplicableRowsScheme[fieldId], {
      consecutiveKey: Util.getNewConsecutiveKey()
    });

    FormActions.insert(fieldId,
      scheme,
      position
    );
  },

  handleChangeRow: function (fieldId, position) {
    this.updateRow(fieldId, position);
  },

  handleRemoveRow: function (fieldId, position, event) {
    event.target.blur();
    event.preventDefault();

    this.removeRow(fieldId, position);
  },

  getHelpText: function () {
    var rows = this.state.rows[fieldsetId];
    var props = this.props;

    if (rows == null) {
      return null;
    }

    var portIdentifiers = Array(rows.length)
      .fill()
      .map((_, i) => "$PORT" + i)
      .join(", ")
      .replace(/(.*), (.*)$/, "$1 and $2");

    var message = t("Configure your application to listen to") +
                  ` ${portIdentifiers}` +
                  t("which will be assigned dynamically.");

    if (props.containerType === ContainerConstants.TYPE.DOCKER) {
      message = t("Configure your Docker container to listen to") +
                  ` ${portIdentifiers}` +
                  t("which will be assigned dynamically.");
    }

    return (
      <div>
        <p>{message}</p>
        {this.getSwitchToJSONModeLink()}
      </div>
    );
  },

  getPortInputField: function (row, i) {
    var props = this.props;

    // TODO
    var fieldTooltipMessage = (
      <span>
        {t("Enter the port you want to assign to your VIP.")}
        <a href={ExternalLinks.PORTS} target="_blank">
          {t("Read more")}
        </a>.
      </span>
    );

    var fieldLabel = (
      <span>
       {t("Port")}
        <TooltipComponent className="right"
            message={fieldTooltipMessage}>
          <i className="icon icon-xs help" />
        </TooltipComponent>
      </span>
    );

    var randomPortField = (
      <FormGroupComponent
          label={fieldLabel}
          value={"$PORT" + i}>
        <input disabled={true} />
      </FormGroupComponent>
    );

    let portFieldClassSet = classNames({
      "hidden": true
    });

    var className = props.hasVIP
      ? "col-sm-3"
      : "col-sm-4";

    return (
      <div className={className}>
        <FormGroupComponent className={portFieldClassSet}
            fieldId={`${fieldsetId}.${i}.port`}
            label={fieldLabel}
            value={row.port}>
          <input ref={`port${i}`} {...PortInputAttributes} />
        </FormGroupComponent>
        {randomPortField}
      </div>
    );
  },

  getVIPField: function (row, i, disableRemoveButton) {
    if (!this.props.hasVIP) {
      return null;
    }

    return (
      <div className="col-sm-5">
        <FormGroupComponent
            fieldId={`${fieldsetId}.${i}.vip`}
            label={t("VIP")}
            value={row.vip}>
          <input ref={`vip${i}`} />
        </FormGroupComponent>
        <DuplicableRowControls
          disableRemoveButton={disableRemoveButton}
          handleAddRow={this.handleAddRow.bind(null, fieldsetId, i + 1)}
          handleRemoveRow=
            {this.handleRemoveRow.bind(null, fieldsetId, i)} />
      </div>
    );
  },

  getPortDefinitionRow: function (row, i, disableRemoveButton = false) {
    var props = this.props;
    var error = this.getError(fieldsetId, row.consecutiveKey);
    var getErrorMessage = props.getErrorMessage;

    var rowClassSet = classNames({
      "has-error": !!error,
      "duplicable-row": true
    });

    var nameFieldButtons = (
      <DuplicableRowControls
        disableRemoveButton={disableRemoveButton}
        handleAddRow={this.handleAddRow.bind(null, fieldsetId, i + 1)}
        handleRemoveRow={this.handleRemoveRow.bind(null, fieldsetId, i)} />
    );

    var nameFieldClassName = "col-sm-6";

    if (props.hasVIP) {
      nameFieldButtons = null;
      nameFieldClassName = "col-sm-2";
    }

    return (
      <div key={row.consecutiveKey+i} className={rowClassSet}>
        <fieldset className="row duplicable-row"
            onChange={this.handleChangeRow.bind(null, fieldsetId, i)}>
          {this.getPortInputField(row, i)}
          <div className="col-sm-2">
            <FormGroupComponent
                errorMessage={
                  getErrorMessage(`${fieldsetId}.${i}.protocol`)
                }
                fieldId={`${fieldsetId}.${i}.protocol`}
                label={t("Protocol")}
                value={row.protocol}>
              <select defaultValue={row.protocol} ref={`protocol${i}`}>
                <option value={ContainerConstants.PORTMAPPINGS.PROTOCOL.TCP}>
                  {ContainerConstants.PORTMAPPINGS.PROTOCOL.TCP}
                </option>
                <option value={ContainerConstants.PORTMAPPINGS.PROTOCOL.UDP}>
                  {ContainerConstants.PORTMAPPINGS.PROTOCOL.UDP}
                </option>
              </select>
            </FormGroupComponent>
          </div>
          <div className={nameFieldClassName}>
            <FormGroupComponent
                fieldId={`${fieldsetId}.${i}.name`}
                label={t("Name")}
                value={row.name}>
              <input ref={`name${i}`} />
            </FormGroupComponent>
            {nameFieldButtons}
          </div>
          {this.getVIPField(row, i, disableRemoveButton)}
        </fieldset>
        {error}
      </div>
    );
  },

  getSwitchToJSONModeLink: function () {
    return (
      <p>
        {t("For more advanced port configuration options, including service " +
           "ports, use")}
        <a className="json-link clickable"
           onClick={this.props.handleModeToggle}>
          {t("JSON mode")}
        </a>.
      </p>
    );
  },

  getPortDefinitionRows: function () {
    var rows = this.state.rows[fieldsetId];

    if (rows == null) {
      return null;
    }

    let disableRemoveButton = this.hasOnlyOneSingleEmptyRow(fieldsetId,
      ["protocol"]);

    return rows.map((row, i) => {
      return this.getPortDefinitionRow(row, i, disableRemoveButton);
    });
  },

  render: function () {
    var props = this.props;

    if (isTooComplexStructure(props.fields, props.hasVIP)) {
      return this.getSwitchToJSONModeLink();
    }

    return (
      <div>
        <div className="duplicable-list">
          {this.getPortDefinitionRows()}
        </div>
        {this.getGeneralErrorBlock(fieldsetId)}
        {this.getHelpText()}
      </div>
    );
  }
});

export default OptionalPortsAndServiceDiscoveryComponent;
