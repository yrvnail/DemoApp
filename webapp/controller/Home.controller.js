sap.ui.define([
	"DemoApp/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("DemoApp.controller.App", {
		
		onInit: function() {
			this._setViewModel();
			this._bindView();
		},

		_bindView: function() {
			var oHomeModel = this.getModel("HomeView");
			var oAuthorsModel = this.getModel("Authors");
			var that = this;
			oHomeModel.pSequentialImportCompleted.then(function() {
				that.setBusy("HomeView", true);
				var sUrl = oHomeModel.getProperty("/apiUrl");
				var sAuthorSetName = oHomeModel.getProperty("/authorSetName");
				jQuery.ajax({
					url: sUrl + sAuthorSetName,
					contentType: "application/json",
					success: function(oData) {
						oAuthorsModel.setSizeLimit(oData.length);
						oAuthorsModel.setProperty("/items", oData);
						that.setBusy("HomeView", false);
					},
					error: function(oError) {
						that.setBusy("HomeView", false);
						
					}
				});
			});

		},

		_setViewModel: function() {
			var sHomeModelPath = jQuery.sap.getModulePath("DemoApp.model.HomeView", ".json");
			var oHomeModel = new JSONModel(sHomeModelPath);
			var oAuthorsModel = new JSONModel();
			var oBooksModel = new JSONModel();
			var oView = this.getView();

			oView.setModel(oHomeModel, "HomeView");
			oView.setModel(oAuthorsModel, "Authors");
			oView.setModel(oBooksModel, "Books");
		},

		onAuthorSelectionChange: function(oEvent) {
			var oHomeModel = this.getModel("HomeView");
			var oAuthorsModel = this.getModel("Authors");
			var oControl = oEvent.getSource();
			var oSelectedItem = oControl.getSelectedItem();
			if (!oSelectedItem){
				return;	
			}
			var sSelectedAuthorId = oSelectedItem.getKey();
			var aItems = oAuthorsModel.getProperty("/items");
			var oSelectedContext = this.getByPropertyValue(aItems, "id", sSelectedAuthorId);
			var sSelectedBookId = oSelectedContext ? oSelectedContext.idBook : null;
			/*
				Т.к., судя по данным, связь авторов и книг соотносится по принципу многие к одному (то есть у нескольких авторов одна книга, но у одного автора не божет быть больше одной книги), 
				то пришлось сделать выборку книг из сета авторов (в API не было ассоциации/ключа, по которому можно было бы получить список книг по id автора напрямую)
			*/
			this.clearModels();
			if (sSelectedBookId) {
				this.getBooksByAuthor(sSelectedBookId);
			}
			oHomeModel.setProperty("/selectedAuthor/id", sSelectedAuthorId);
		},

		getBooksByAuthor: function(sBookId) {
			var oHomeModel = this.getModel("HomeView");
			var oBooksModel = this.getModel("Books");
			var sUrl = oHomeModel.getProperty("/apiUrl");
			var sBookSetName = oHomeModel.getProperty("/bookSetName");
			var that = this;
			jQuery.ajax({
				url: sUrl + sBookSetName + "/" + sBookId,
				contentType: "application/json",
				success: function(oData) {
					oData = Array.isArray(oData) ? oData : [oData];
					oBooksModel.setProperty("/items", oData);
					that.setBusy("HomeView", false);
				},
				error: function() {
					that.setBusy("HomeView", false);
					that.showMessageToast("demoapp.error.books");
				}
			});
		},
		
		onBookChange: function(oEvent){
			var oHomeModel = this.getModel("HomeView");
			var oBooksModel = this.getModel("Books");
			var oControl = oEvent.getSource();
			var oSelectedItem = oControl.getSelectedItem();
			if (!oSelectedItem){
				return;	
			}
			var sSelectedBookId = oSelectedItem.getKey();
			var aItems = oBooksModel.getProperty("/items");
			var oSelectedContext = this.getByPropertyValue(aItems, "id", sSelectedBookId);
			var sPublishDate = oSelectedContext.publishDate;
			if (sPublishDate){
				oSelectedContext.publishDate = this.formatISODate(sPublishDate);				
			}
			oHomeModel.setProperty("/selectedBook/", oSelectedContext);
		},
		
		clearModels: function(){
			var oHomeModel = this.getModel("HomeView");
			oHomeModel.setProperty("/selectedAuthor/id", "");
			oHomeModel.setProperty("/selectedBook/id", "");
			oHomeModel.setProperty("/selectedBook/title", "");
			oHomeModel.setProperty("/selectedBook/description", "");
			oHomeModel.setProperty("/selectedBook/pageCount", "");
			oHomeModel.setProperty("/selectedBook/excerpt", "");
			oHomeModel.setProperty("/selectedBook/publishDate", "");
		},
		
		getByPropertyValue: function(aArray, sProperty, sValue) {
			sValue = parseInt(sValue);
			for (var i = 0; i<aArray.length; i++) {
				if (aArray[i][sProperty] === sValue) { return aArray[i]; }
			}
		},
		
		formatISODate: function(sDate){
			var oDate = new Date(sDate);
			var iYear = oDate.getFullYear();
			var iMonth = oDate.getMonth()+1;
			var iDay = oDate.getDate();
			
			if (iDay < 10) {
			  iDay = '0' + iDay;
			}
			if (iMonth < 10) {
			  iMonth = '0' + iMonth;
			}
			
			return iYear + "-" + iMonth + "-" + iDay;
		}
	});
});