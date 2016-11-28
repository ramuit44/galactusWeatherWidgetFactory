// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: 'app/',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
     
      {pattern: 'bower_components/angular/angular.js', included: true},
      {pattern: 'bower_components/angular-mocks/angular-mocks.js', included: true},
      {pattern: 'bower_components/jquery/dist/jquery.min.js', included: true},
      {pattern: 'bower_components/angular-sanitize/angular-sanitize.js', included: true},
      {pattern: 'bower_components/moment/moment.js', included: true},
      
      'galactus-weather-widget-directive.js',
      'app.js',
      'galactus-weather-widget-editor-output-directive.js',

      
      '../test/mock/**/*.js',
      '../test/spec/**/*.js',
      'templates/*.html'
    ],

    // list of files / patterns to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
       '*.js': ['coverage'],
        "templates/*.html": "ng-html2js"
    },

    // web server port
    port: 9876,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    ngHtml2JsPreprocessor: {
        //
        // Make up a module name to contain your templates.
        // We will use this name in the jasmine test code.
        // For advanced configs, see https://github.com/karma-runner/karma-ng-html2js-preprocessor
        moduleName: 'test-templates',
    },


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['Safari'],
    singleRun: true,

    // browsers: ['Chrome'],
    // singleRun: true,


    //'progress','html', 'coverage'
    //'dots', 'junit'
    reporters: ['progress','junit', 'coverage'],
    
    junitReporter: {
      outputFile: '../test-results.xml'
    },

     // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    coverageReporter: {
      type : 'html',
      dir : '../coverage/'
    }

    // the default configuration
    /*htmlReporter: {
      outputDir: 'C://karma_html_Reports', // where to put the reports 
      templatePath: null, // set if you moved jasmine_template.html
      focusOnFailures: false, // reports show failures on start
      namedFiles: true, // name files instead of creating sub-directories
      pageTitle: null, // page title for reports; browser info by default
      urlFriendlyName: false, // simply replaces spaces with _ for files/dirs
      reportName: 'Karma_Test_Report', // report summary filename; browser info by default


      // experimental
      preserveDescribeNesting: false, // folded suites stay folded 
      foldAll: true, // reports start folded (only with preserveDescribeNesting)
    },*/


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    
  });
};
