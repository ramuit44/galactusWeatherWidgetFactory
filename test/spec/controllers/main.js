
describe('Service : WeatherService', function () {

  var weatherService, $httpBackend, $q, $scope, $window, $compile, $geolocation, $controller1, $filter;

  // load the controller's module
  beforeEach(module('galactusWeatherApp','test-templates'));


  var mockWeatherObject = {
        'coord': {
          'lon':-87.63,
          'lat':41.88
        },
        'sys':{
          'type':1,
          'id':961,
          'message':0.3266,
          'country':'United States of America',
          'sunrise':1409743141,'sunset':1409790017
        },
        'weather':[
          {
            'id':500,
            'main':'Rain',
            'description':'light rain',
            'icon':'10d'
          }
        ],
        'base':'cmc stations',
        'main':{
          'temp':81.88,
          'pressure':1016,
          'humidity':48,
          'temp_min':78.8,
          'temp_max':84
        },
        'wind':{
          'speed':7.78,
          'deg':260,
          'gust':7.7
        },
        'rain':{
          '1h':0.25
        },
        'clouds':{
          'all':20
        },
        'dt':1409770382,
        'id':0,
        'name':'Chicago',
        'cod':200
      };

    var mockLocationObject = {};
    var defaultCordinates = {
          latitude:33,
          longitude:151
    };
    mockLocationObject.coords = defaultCordinates;






  // Initialize the controller and a mock scope
  beforeEach(inject(function (_weatherService_, _$httpBackend_,_$q_,_$rootScope_,_$window_,_$compile_,_$controller_,_$filter_) {
    weatherService = _weatherService_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    $scope = _$rootScope_.$new();
    $window = _$window_;
    $geoLocation = $window.navigator.geolocation;
    $compile = _$compile_;
    $controller1 = _$controller_;
    $filter=_$filter_;
   
  }));

  afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });


  


  it('test weatherService.getWeather for a given lat and long ', function () {

    $httpBackend.whenGET('http://api.openweathermap.org/data/2.5/weather?appid=227b37f61eeafe6959b97149fff86cc2&lat=33&lon=151&units=imperial&cnt=5').respond(
      mockWeatherObject
    );

    weatherService.getWeather('imperial','true',mockLocationObject).then(function(weatherData)
    {
      expect(weatherData.main.temp).toBe(81.88);
    });

    $httpBackend.flush();

  });


  it('test weatherService.populateModalObjectFromResponse for weather reponse Object ', function () {

    var appWeatherObj = weatherService.populateModalObjectFromResponse(mockWeatherObject,'some');
    expect(appWeatherObj.temp.current ).toBe(81.88);

  });


  it('test currentWeather directive ', function () {

     
       var html = '<current-weather  units="imperial"  showwind="true" title="rams"> </current-weather>';
       deferred1= $q.defer();
       spyOn(weatherService, 'getCurrentPosition').andReturn(deferred1.promise);
       deferred1.resolve(mockLocationObject);
       $scope.$apply();

       $httpBackend.whenGET('http://api.openweathermap.org/data/2.5/weather?appid=227b37f61eeafe6959b97149fff86cc2&lat=33&lon=151&units=imperial&cnt=5').respond(
        mockWeatherObject
        );

       var element = $compile(html)($scope);
        $scope.$digest();
        //console.log(element.isolateScope());
       
        $httpBackend.flush();

        expect(element.html()).toContain("imperial");

  });




it('test weatherWidgetEditorOutput directive ', function () {

       var html = '<weather-widget-editor-output  units="imperial"  showwind="true" title="rams"> </weather-widget-editor-output>';
       deferred1= $q.defer();
       spyOn(weatherService, 'getCurrentPosition').andReturn(deferred1.promise);
       deferred1.resolve(mockLocationObject);
       $scope.$apply();

       $httpBackend.whenGET('http://api.openweathermap.org/data/2.5/weather?appid=227b37f61eeafe6959b97149fff86cc2&lat=33&lon=151&units=imperial&cnt=5').respond(
        mockWeatherObject
        );

       var element = $compile(html)($scope);
        $scope.$digest();
        //console.log(element.isolateScope());
       
        $httpBackend.flush();

        expect(element.html()).toContain("imperial");

  });



   it('test Widget editor controller reset ', function () {

    var $scope = {};
    var controller = $controller1('weatherWidgetEditorCtrl', { $scope: $scope });
    $scope.widgetForm = {
    };
    $scope.reset();
    expect($scope.submitted).toBe(false);
  });

   it('test Widget editor controller save ', function () {

    var $scope = {};
    var controller = $controller1('weatherWidgetEditorCtrl', { $scope: $scope });
    $scope.widgetForm = {"title":"rams","showwind":"true","units":"metric"};
    $scope.userForm={};
    $scope.userForm.$invalid = false;
    $scope.save();
    expect($scope.widgetConfigs.length).toBe(1);
  });


   it('test Widget editor controller duplicate ', function () {

    var $scope = {};
    var controller = $controller1('weatherWidgetEditorCtrl', { $scope: $scope });
    $scope.widgetForm = {"title":"rams","showwind":"true","units":"metric"};
    $scope.userForm={};
    $scope.widgetConfigs=[{
      "title":"rams","showwind":"true","units":"metric"
    }];
    $scope.userForm.$invalid = false;
    $scope.save();
    expect($scope.widgetConfigs.length).not.toBe(2);
  });



   it('test temparature filter ', function () {

    result = $filter('temparature')(28.32, 1);
    expect(result).toBe('28.3'+ '&deg;');
  });


   it('test getCurrentPosition positive', function () {

      spyOn($window.navigator.geolocation, 'getCurrentPosition').andCallFake(function() {
      var position = { coords: { latitude: 12.3, longitude: -32.1 } };
        arguments[0](position);
      });

       $scope.$digest();
       weatherService.getCurrentPosition().then(
        function(result){
          expect(result.coords.latitude).toBe(12.3); 
        }
        );

   });




  
});
