'use strict';

var JSHINT = require('jshint').JSHINT;
var jshintcli = require('jshint/src/cli.js');

var through = require('through');

module.exports = function(file) {

    var data = '';

    return through(
        function write(buf) {
            data += buf;
        },
        function end() {

            var files = jshintcli.gather({ args: [file] });
            var isIgnored = files.length === 0;

            if (!isIgnored) {
                var config = jshintcli.getConfig(file);
                delete config.dirname;

                if (!JSHINT(data, config, config.globals)) {
                    var error = new Error();
                    error.name = 'LintingError';
                    error.message = JSHINT.errors.map(formatError).join('\n');
                    this.emit('error', error);
                }
            }

            this.queue(data);
            this.queue(null);
        }
    );

    function formatError(error) {
        if (error) {
            return file + ': line ' + error.line + ', col ' + error.character + ', ' + error.reason;
        }
    }
};

