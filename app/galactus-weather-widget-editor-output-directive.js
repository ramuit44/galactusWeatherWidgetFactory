app.directive('weatherWidgetEditorOutput', function(){
  return {
    restrict:'E',
    scope: {
      units: '@?',
      title: '@',
      showwind: '@?'
    },
    templateUrl:'templates/weatherWidgetEditorOutput.html',
    link: function(scope, iElem, iAttr){
      
    }
  };
});
