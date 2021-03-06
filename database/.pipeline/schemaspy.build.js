'use strict';
const buildSchemaspyTask = require('./lib/schemaspy.build.js');
const config = require('./config.js');

const settings = { ...config, phase: 'build' };

// build schemaspy image
buildSchemaspyTask(settings);
