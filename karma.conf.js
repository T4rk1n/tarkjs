// Karma configuration
// Generated on Thu Jul 13 2017 01:43:27 GMT-0400 (Eastern Daylight Time)


// eslint-disable-next-line no-undef
module.exports = function(config) {
    config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['browserify', 'jasmine', 'websocket-server'],


        // list of files / patterns to load in the browser
        files: [
            'src/**/*.js',
            'test/**/*.js',
            {pattern: 'test/**/*.txt', watched: false, included: false, served: true, nocache: false},
            {pattern: 'test/**/*.json', watched: false, included: false, served: true, nocache: false},
            {pattern: 'test/**/*.css', watched: false, included: false, served: true, nocache: false},
        ],

        // list of files to exclude
        exclude: [
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'src/**/*.js': ['browserify'],
            'test/**/*.js': ['browserify']
        },

        browserify: {
            debug: true,
            transform: ['babelify']
        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'coverage'],

        coverageReporter: {
            // eslint-disable-next-line no-undef
            type: 'lcovonly',
            dir: 'coverage/',
            reporters: [
                { type: 'lcov', subdir: 'report-lcov' },
                { type: 'lcovonly', subdir: '.', file: 'lcov.info' }
            ]
        },

        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['ChromeHeadless'],
        phantomjsLauncher: {
            exitOnResourceError: true
        },

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity,

        websocketServer: {
            port: 8889,
            beforeStart: (server) => {
                server.on('request', (req) => {
                    // Just echo back the message...
                    const connection  = req.accept('echo-protocol', req.origin)
                    connection.on('message', (msg) => {
                        connection.sendUTF(msg.utf8Data)
                    })
                })
            }
        }
    })
}
