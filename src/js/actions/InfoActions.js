var oboe = require("oboe");

var config = require("../config/config");
var AppDispatcher = require("../AppDispatcher");
var InfoEvents = require("../events/InfoEvents");

var InfoActions = {
  requestInfo: function () {
    this.request({
      url: config.apiURL + "v2/info"
    })
    .start(function (status) {
      this.status = status;
    })
    .done(function (info) {
      if (this.status !== 200) {
        return;
      }
      AppDispatcher.dispatch({
        actionType: InfoEvents.REQUEST,
        data: info
      });
    })
    .fail(function (error) {
      AppDispatcher.dispatch({
        actionType: InfoEvents.REQUEST_ERROR,
        data: error
      });
    });
  },
  request: oboe
};

module.exports = InfoActions;