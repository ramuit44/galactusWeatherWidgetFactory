
  /**
  * galactusWeatherApp Module
  *
  * galactusWeatherApp container of weather widget editor controllers. ngSanitize module provides functionality to sanitize HTML.  weatherWidgetModule provides functionality of weather widget.
  */
 var galactusWeatherApp = angular.module('galactusWeatherApp', ["weatherWidgetModule", "ngSanitize"]);

 /**
  * weatherWidgetEditorCtrl Controller
  *
  * Controller constructor with dependencies injected.
  */
 galactusWeatherApp.controller('weatherWidgetEditorCtrl', ['$scope', function($scope) {

 	$scope.submitted = false;

    //base model object to hold the widget editor form information
 		$scope.widgetForm = {
 		};

    //Array model to hold the list of created widgetform base models
 		$scope.widgetConfigs = [];

    //Function to validate the form and if valid save the widgetForm modal  object into the existing widgetConfigs array.
 		$scope.save = function(){
 			$scope.submitted = true;

 			if($scope.userForm.$invalid){return;}
 			if(isDuplicate($scope.widgetForm,$scope.widgetConfigs)) {$scope.duplicate=true; return;}

 			$scope.widgetConfigs.push(angular.copy($scope.widgetForm));
			$scope.reset();
  		};

     //Function to reset the form and some modal default values. 
 		$scope.reset = function(){
 			$scope.submitted = false;
 			$scope.duplicate = false;
 			$scope.widgetForm.title = '';
 		};

    //Method to check if already another widget with same title exists.  The function Need not be a scope level, but can be controller level . 

    // Mhhh... Ideally this should be a part of a static Utility service method and inject that Utility service to the controller and use it. For now having it in controller. :)
 		function isDuplicate(widgetForm,store){
 			for (var x in store) {
    				if (store[x].title == widgetForm.title) {
        			return true;
    				}
				}

				return false;
 		}

 		
 		

}]);