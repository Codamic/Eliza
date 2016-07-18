import React from "react/addons";
import classNames from "classnames";
import Util from "../helpers/Util";

import AppsEvents from "../events/AppsEvents";
import AppFormErrorMessages from "../constants/AppFormErrorMessages";
import AppFormStore from "../stores/AppFormStore";
import AppsStore from "../stores/AppsStore";
import ContainerConstants from "../constants/ContainerConstants";
import ContainerSettingsComponent
  from "../components/ContainerSettingsComponent";
import ContentComponent from "../components/ContentComponent";
import FormActions from "../actions/FormActions";
import FormEvents from "../events/FormEvents";
import FormGroupComponent from "../components/FormGroupComponent";
import HealthChecksComponent from "../components/HealthChecksComponent";
import MenuComponent from "../components/MenuComponent";
import MenuItemComponent from "../components/MenuItemComponent";
import OptionalDockerPortMappingsComponent
  from "../components/OptionalDockerPortMappingsComponent";
import OptionalEnvironmentComponent
  from "../components/OptionalEnviromentComponent";
import OptionalLabelsComponent from "../components/OptionalLabelsComponent";
import OptionalPortsAndServiceDiscoveryComponent
  from "../components/OptionalPortsAndServiceDiscoveryComponent";
import OptionalSettingsComponent
  from "../components/OptionalSettingsComponent";
import OptionalVolumesComponent
  from "../components/OptionalVolumesComponent";
import SectionComponent from "../components/SectionComponent";

import t from "../config/i18n";

var AppConfigEditFormComponent = React.createClass({
  displayName: "AppConfigEditFormComponent",

  propTypes: {
    app: React.PropTypes.object,
    features: React.PropTypes.array,
    handleModeToggle: React.PropTypes.func.isRequired,
    onChange: React.PropTypes.func.isRequired,
    onError: React.PropTypes.func.isRequired
  },

  getDefaultProps: function () {
    return {
      app: null,
      features: []
    };
  },

  getInitialState: function () {
    var app = this.props.app;
    AppFormStore.initAndReset();

    if (app != null) {
      AppFormStore.populateFieldsFromAppDefinition(app);
    }

    return {
      activeSection: "general",
      errorIndices: AppFormStore.validationErrorIndices,
      fields: AppFormStore.fields,
      isVolumesOpen: false,
      responseErrorMessages: AppFormStore.responseErrors
    };
  },

  componentWillMount: function () {
    AppsStore.on(AppsEvents.CREATE_APP_ERROR, this.onCreateAppError);
    AppsStore.on(AppsEvents.APPLY_APP_ERROR, this.onApplyAppError);
    AppFormStore.on(FormEvents.CHANGE, this.onFormChange);
    AppFormStore.on(FormEvents.FIELD_VALIDATION_ERROR,
      this.onFieldValidationError);
  },

  setCursorToEndOfAppIdInput: function () {
    var appIdInput = React.findDOMNode(this.refs.appId);
    appIdInput.focus();
    var valueLength = appIdInput.value.length;
    appIdInput.setSelectionRange(valueLength, valueLength);
  },

  componentWillUnmount: function () {
    AppsStore.removeListener(AppsEvents.CREATE_APP_ERROR,
      this.onCreateAppError);
    AppsStore.removeListener(AppsEvents.APPLY_APP_ERROR,
      this.onApplyAppError);
    AppFormStore.removeListener(FormEvents.CHANGE, this.onFormChange);
    AppFormStore.removeListener(FormEvents.FIELD_VALIDATION_ERROR,
      this.onFieldValidationError);
  },

  onApplyAppError: function (error, isEditing, status) {
    if (!isEditing) {
      return;
    }
    this.onCreateAppError(error, status);
  },

  onCreateAppError: function (data, status) {
    if (!(status === 409 && data.deployments != null)) {
      // a 409 error without deployments is a field conflict
      this.setState({
        responseErrorMessages: AppFormStore.responseErrors
      });
    }
  },

  onFieldValidationError: function () {
    this.setState({
      fields: AppFormStore.fields,
      errorIndices: AppFormStore.validationErrorIndices
    }, () => {
      this.props.onError(this.getErrorMessage("general"));
    });
  },

  onFormChange: function (fieldId) {
    var responseErrorMessages = this.state.responseErrorMessages;

    // At present we assume that the supplied filed value as well as the general
    // config is valid.
    if (responseErrorMessages != null) {
      delete responseErrorMessages["general"];
      delete responseErrorMessages[fieldId];
    }

    this.setState({
      fields: AppFormStore.fields,
      errorIndices: AppFormStore.validationErrorIndices,
      responseErrorMessages: responseErrorMessages
    }, () => {
      if (!!Object.keys(this.state.errorIndices).length) {
        this.props.onError(this.getErrorMessage("general"));
      } else {
        this.props.onChange(AppFormStore.app);
      }
    });
  },

  handleFieldUpdate: function (fieldId, value) {
    FormActions.update(fieldId, value);
  },

  getErrorMessage: function (fieldId) {
    var state = this.state;
    var errorIndex = state.errorIndices[fieldId];
    if (errorIndex != null && !Util.isObject(errorIndex)) {
      return AppFormErrorMessages.getFieldMessage(fieldId, errorIndex);
    }
    if (state.responseErrorMessages[fieldId] != null) {
      return state.responseErrorMessages[fieldId];
    }
    return null;
  },

  fieldsHaveError: function (fieldIds) {
    var state = this.state;
    var errorIndices = state.errorIndices;
    var responseMessages = state.responseErrorMessages;

    return !!Object.values(fieldIds).find((fieldId) => {
      return errorIndices[fieldId] != null || responseMessages[fieldId] != null;
    });
  },

  hasFeature: function (feature) {
    var features = this.props.features;

    return Util.isArray(features) && features.includes(feature);
  },

  hasVIP: function () {
    return this.hasFeature("vips");
  },

  hasExternalVolumes: function () {
    return this.hasFeature("external_volumes");
  },

  onMenuChange: function (menuItemValue) {
    this.setState({
      activeSection: menuItemValue
    });
  },

  setViewVolumes: function () {
    this.onMenuChange("volumes");
  },

  setViewPorts: function () {
    this.onMenuChange("ports");
  },

  getOptionalPortsComponent: function () {
    var state = this.state;

    if (state.fields.dockerNetwork === ContainerConstants.NETWORK.BRIDGE) {
      return (
        <OptionalDockerPortMappingsComponent
          errorIndices={state.errorIndices}
          fields={state.fields}
          getErrorMessage={this.getErrorMessage}
          handleModeToggle={this.props.handleModeToggle}
          hasVIP={this.hasVIP()} />
      );
    }

    const type = state.fields.dockerNetwork === ContainerConstants.NETWORK.HOST
      ? ContainerConstants.TYPE.DOCKER
      : ContainerConstants.TYPE.MESOS;

    return (
      <OptionalPortsAndServiceDiscoveryComponent
        containerType={type}
        errorIndices={state.errorIndices}
        fields={state.fields}
        getErrorMessage={this.getErrorMessage}
        handleModeToggle={this.props.handleModeToggle}
        hasVIP={this.hasVIP()} />
    );
  },

  getPortsPanelTitle: function () {
    var title = t("Ports");

    if (this.hasVIP()) {
      title = t("Ports & Service Discovery");
    }

    return (
      <span>{title}</span>
    );
  },

  render: function () {
    var state = this.state;

    var generalMenuItemClassSet = classNames({
      "error": this.fieldsHaveError({
        appId: "appId",
        cpus: "cpus",
        mem: "mem",
        disk: "disk",
        instances: "instances",
        cmd: "cmd"
      })
    });

    var containerMenuItemClassSet = classNames({
      "error": this.fieldsHaveError({container: "container"})
    });

    var portsMenuItemClassSet = classNames({
      "error": this.fieldsHaveError({portDefinitions: "portDefinitions"})
    });

    var envMenuItemClassSet = classNames({
      "error": this.fieldsHaveError({env: "env"})
    });

    var labelsMenuItemClassSet = classNames({
      "error": this.fieldsHaveError({labels: "labels"})
    });

    var healthMenuItemClassSet = classNames({
      "error": this.fieldsHaveError({healthChecks: "healthChecks"})
    });

    var volumesMenuItemClassSet = classNames({
      "error": this.fieldsHaveError({localVolumes: "localVolumes"})
    });

    var optionalMenuItemClassSet = classNames({
      "error": this.fieldsHaveError(OptionalSettingsComponent.fieldIds)
    });

    return (
      <div className="app-config-edit">
        <MenuComponent selected={state.activeSection} className="col-sm-3"
            onChange={this.onMenuChange}>
          <MenuItemComponent value="general"
              className={generalMenuItemClassSet}>
            {t("General")}
          </MenuItemComponent>
          <MenuItemComponent value="container"
              className={containerMenuItemClassSet}>
            {t("Docker Container")}
          </MenuItemComponent>
          <MenuItemComponent value="ports"
             className={portsMenuItemClassSet}>
            {this.getPortsPanelTitle()}
          </MenuItemComponent>
          <MenuItemComponent value="env"
              className={envMenuItemClassSet}>
            {t("Environment Variables")}
          </MenuItemComponent>
          <MenuItemComponent value="labels"
              className={labelsMenuItemClassSet}>
            {t("Labels")}
          </MenuItemComponent>
          <MenuItemComponent value="health"
              className={healthMenuItemClassSet}>
            {t("Health Checks")}
          </MenuItemComponent>
          <MenuItemComponent value="volumes"
              className={volumesMenuItemClassSet}>
            {t("Volumes")}
          </MenuItemComponent>
          <MenuItemComponent value="optional"
              className={optionalMenuItemClassSet}>
            {t("Optional")}
          </MenuItemComponent>
        </MenuComponent>
        <ContentComponent active={state.activeSection}
            className="content-component">
          <SectionComponent sectionId="general"
              onActive={this.setCursorToEndOfAppIdInput}>
            <FormGroupComponent errorMessage={this.getErrorMessage("appId")}
                fieldId="appId"
                value={state.fields.appId}
                label={t("ID")}
                onChange={this.handleFieldUpdate}>
              <input ref="appId"/>
            </FormGroupComponent>
            <div className="row">
              <div className="col-sm-3">
                <FormGroupComponent errorMessage={this.getErrorMessage("cpus")}
                  fieldId="cpus"
                  label={t("CPUs")}
                  value={state.fields.cpus}
                  onChange={this.handleFieldUpdate}>
                  <input min="0" step="any" type="number"/>
                </FormGroupComponent>
              </div>
              <div className="col-sm-3">
                <FormGroupComponent fieldId="mem" label={t("Memory (MiB)")}
                  errorMessage={this.getErrorMessage("mem")}
                  value={state.fields.mem}
                  onChange={this.handleFieldUpdate}>
                  <input min="0" step="any" type="number"/>
                </FormGroupComponent>
              </div>
              <div className="col-sm-3">
                <FormGroupComponent fieldId="disk" label={t("Disk Space (MiB)")}
                  errorMessage={this.getErrorMessage("disk")}
                  value={state.fields.disk}
                  onChange={this.handleFieldUpdate}>
                  <input min="0" step="any" type="number"/>
                </FormGroupComponent>
              </div>
              <div className="col-sm-3">
                <FormGroupComponent fieldId="instances" label={t("Instances")}
                  errorMessage={this.getErrorMessage("instances")}
                  value={state.fields.instances}
                  onChange={this.handleFieldUpdate}>
                  <input min="0" step="1" type="number"/>
                </FormGroupComponent>
              </div>
            </div>
            <FormGroupComponent errorMessage={this.getErrorMessage("cmd")}
              fieldId="cmd"
              label={t("Command")}
              help={t("May be left blank if a container image is supplied")}
              value={state.fields.cmd}
              onChange={this.handleFieldUpdate}>
              <textarea style={{resize: "vertical"}} rows="3"/>
            </FormGroupComponent>
          </SectionComponent>
          <SectionComponent sectionId="container">
            <ContainerSettingsComponent
              errorIndices={state.errorIndices}
              fields={state.fields}
              getErrorMessage={this.getErrorMessage}
              openPorts={this.setViewPorts}
              openVolumes={this.setViewVolumes}/>
          </SectionComponent>
          <SectionComponent sectionId="ports">
            {this.getOptionalPortsComponent()}
          </SectionComponent>
          <SectionComponent sectionId="env">
            <OptionalEnvironmentComponent
              errorIndices={state.errorIndices}
              getErrorMessage={this.getErrorMessage}
              fields={state.fields}/>
          </SectionComponent>
          <SectionComponent sectionId="labels">
            <OptionalLabelsComponent
              errorIndices={state.errorIndices}
              getErrorMessage={this.getErrorMessage}
              fields={state.fields}/>
          </SectionComponent>
          <SectionComponent sectionId="health">
            <HealthChecksComponent
              errorIndices={state.errorIndices}
              fields={state.fields}
              getErrorMessage={this.getErrorMessage}/>
          </SectionComponent>
          <SectionComponent sectionId="volumes">
            <OptionalVolumesComponent
              errorIndices={state.errorIndices}
              getErrorMessage={this.getErrorMessage}
              fields={state.fields}
              hasExternalVolumes={this.hasExternalVolumes()} />
          </SectionComponent>
          <SectionComponent sectionId="optional">
            <OptionalSettingsComponent
              errorIndices={state.errorIndices}
              fields={state.fields}
              getErrorMessage={this.getErrorMessage}/>
          </SectionComponent>
        </ContentComponent>
      </div>
    );
  }
});

export default AppConfigEditFormComponent;
