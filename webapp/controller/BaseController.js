sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function(Controller, History, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("DemoApp.controller.BaseController", {

		getModel: function(sName) {
			return this.getView().getModel(sName);
		},

		setModel: function(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		setBusy: function(sModelName, bState) {
			this.getModel(sModelName).setProperty("/busy", bState);
		},

		setJsonModel: function(sModelName) {
			var oJsonModel = new JSONModel();
			this.setModel(oJsonModel, sModelName);
		},
		
		showMessageToast: function(sText) {
			var oI18n = this.getResourceBundle();
			MessageToast.show(oI18n.getText(sText), {
				duration: 3000,
				autoClose: true,
				animationTimingFunction: "ease",
				animationDuration: 1000,
				closeOnBrowserNavigation: false
			});
		}

	});

});