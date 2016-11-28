module.exports = function(grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    target: {
      // configurable paths
      app: require('./bower.json').appPath || 'app',
      dist: 'dist'
    },
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['app/*.js', 'tmp/templates.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>'],
          'dist/<%= pkg.widgetname %>.min.js':['app/<%= pkg.widgetname %>.js'],
          'app/<%= pkg.widgetname %>.min.js':['app/<%= pkg.widgetname %>.js']
        }
      }
    },
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= target.dist %>/*',
            '!<%= target.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },
    copy: {
      dist: {
        expand:true,
        cwd:'app/',
        src:'*.{html,js,css,eot,svg,ttf,woff}',
        dest: 'dist/'
      },
      styles: {
        expand: true,
        cwd: '<%= target.app %>/styles',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
      }
    },

    connect: {
      options: {
        port: 9005,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729,
        
        middleware: function(connect, options, middlewares) {
          middlewares.unshift(function(req, res, next) {
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Access-Control-Allow-Methods', '*');
              next();
          });

          return middlewares;
        }

    },
      livereload: {
        options: {
          open: true,
          base: [
            '.tmp',
            '<%= target.app %>',
            '.'
          ]
        }
      },
      test: {
        options: {
          port: 9001,
          base: [
            '.tmp',
            'test',
            '<%= target.app %>'
          ]
        }
      },
      dist: {
        options: {
          base: '../<%= target.app %>'
        }
      }
    },
    //For now 
    jshint: {
      files: ['Gruntfile.js', 'app/*.js','!app/*.min.js'],
      options: {
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true,
          angular   : false
        },
        reporterOutput: ""
      }
    },

    cssmin : {
      options: {
            keepSpecialComments: 0
      },
      minify : {
            expand : true,
            cwd : 'app/styles',
            src : ['*.css', '!*.min.css'],
            dest : 'app/styles',
            ext : '.min.css'
      },
      combine : {
        files: {
            'app/styles/app.combined.min.css': ['app/styles/galactus-weather-widget-editor.min.css', 'app/styles/galactus-weather-widget.min.css']
        }
      }
    },

    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
    },
    html2js: {
      options: {
        base:'app/',
        // custom options, see below
       
      },
      main: {
        src: ['app/**/*.html'],
        dest: 'tmp/templates.js'
      },
    },
    // Allow the use of non-minsafe AngularJS files. Automatically makes it
    // minsafe compatible so Uglify does not destroy the ng references
    ngmin: {
      dist: {
        files: [{
          expand: true,
          cwd: 'dist/',
          src: '<%= pkg.name %>.js',
          dest: 'dist/'
        }]
      }
    },
    concurrent: {
      server: [
        'copy:styles'
      ],
      test: [
        'copy:styles'
      ],
      dist: [
        'copy:styles',
      ]
    },
    ngAnnotate:{
      dist:{
        files:[{
          src:'<%= concat.dist.dest %>',
          expand:true
        },
        {
          src:'app/<%= pkg.widgetname %>.js',
          expand:true
        }
        ]
      }
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js'
       
      }
    }
  });

  grunt.registerTask('test', ['jshint']);

  grunt.registerTask('runtests', [
    'clean:server',
    'concurrent:test',
    'karma'
  ]);

  grunt.registerTask('run', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'concurrent:server',
      'connect:livereload',
      'watch'
    ]);




  });


  grunt.registerTask('default', ['clean','jshint', 'html2js', 'ngAnnotate:dist','concat', 'uglify', 'copy', 'cssmin']);

};