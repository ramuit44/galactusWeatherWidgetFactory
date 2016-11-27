
  /**
  * galactusWeatherApp Module
  *
  * Description
  */
 var app = angular.module('galactusWeatherApp', ["weatherWidgetModule", "ngSanitize"]);

 app.controller('weatherWidgetEditorCtrl', ['$scope', function($scope) {

 	$scope.submitted = false;

 		$scope.widgetForm = {
 		};

 		$scope.widgetConfigs = [];

 		$scope.save = function(){
 			$scope.submitted = true;

 			if($scope.userForm.$invalid){return;}
 			if(isDuplicate($scope.widgetForm,$scope.widgetConfigs)) {$scope.duplicate=true; return;}

 			$scope.widgetConfigs.push(angular.copy($scope.widgetForm));
			$scope.reset();
  		}

 		$scope.reset = function(){
 			$scope.submitted = false;
 			$scope.duplicate = false;
 			$scope.widgetForm.title = '';
 		}

 		function isDuplicate(widgetForm,store){
 			for (x in store) {
    				if (store[x].title == widgetForm.title) {
        			return true;
    				}
				}

				return false;
 		}

 		
 		

}]);