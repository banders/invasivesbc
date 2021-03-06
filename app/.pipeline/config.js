'use strict';
let options = require('pipeline-cli').Util.parseArguments();

// The root config for common values
const config = require('../../.config/config.json');

const defaultHost = 'invasivebci-7068ad-dev.apps.silver.devops.gov.bc.ca';
const defaultHostAPI = 'invasivebci-7068ad-api-dev.apps.silver.devops.gov.bc.ca';

const name = (config.module && config.module['app']) || 'invasivesbci-app';
const apiName = (config.module && config.module['api']) || 'invasivesbci-api';

const changeId = options.pr || `${Math.floor(Date.now() * 1000) / 60.0}`; // aka pull-request or branch
const version = config.version || '1.0.0';

// A static deployment is when the deployment is updating dev, test, or prod (rather than a temporary PR)
const isStaticDeployment = options.type === 'static';

const deployChangeId = (isStaticDeployment && 'deploy') || changeId;
const branch = (isStaticDeployment && options.branch) || null;
const tag = (branch && `build-${version}-${changeId}-${branch}`) || `build-${version}-${changeId}`;

const staticBranches = config.staticBranches || [];
const staticUrls = config.staticUrls || {};
const staticUrlsAPI = config.staticUrlsAPI || {};

const sso = config.sso;

const processOptions = (options) => {
  const result = { ...options };

  // Check git
  if (!result.git.url.includes('.git')) {
    result.git.url = `${result.git.url}.git`;
  }

  if (!result.git.http_url.includes('.git')) {
    result.git.http_url = `${result.git.http_url}.git`;
  }

  // Fixing repo
  if (result.git.repository.includes('/')) {
    const last = result.git.repository.split('/').pop();
    const final = last.split('.')[0];
    result.git.repository = final;
  }

  return result;
};

options = processOptions(options);

const phases = {
  build: {
    namespace: '7068ad-tools',
    name: `${name}`,
    phase: 'build',
    changeId: changeId,
    suffix: `-build-${changeId}`,
    instance: `${name}-build-${changeId}`,
    version: `${version}-${changeId}`,
    tag: tag,
    env: 'build',
    branch: branch
  },
  dev: {
    namespace: '7068ad-dev',
    name: `${name}`,
    phase: 'dev',
    changeId: deployChangeId,
    suffix: `-dev-${deployChangeId}`,
    instance: `${name}-dev-${deployChangeId}`,
    version: `${deployChangeId}-${changeId}`,
    tag: `dev-${version}-${deployChangeId}`,
    host:
      (isStaticDeployment && (staticUrls.dev || defaultHost)) || `${name}-${changeId}-7068ad-dev.apps.silver.devops.gov.bc.ca`,
    apiHost:
      (isStaticDeployment && (staticUrlsAPI.dev || defaultHostAPI)) ||
      `${apiName}-${changeId}-7068ad-dev.apps.silver.devops.gov.bc.ca`,
    env: 'dev',
    sso: sso.dev,
    replicas: 1,
    maxReplicas: 1
  },
  test: {
    namespace: '7068ad-test',
    name: `${name}`,
    phase: 'test',
    changeId: deployChangeId,
    suffix: `-test`,
    instance: `${name}-test`,
    version: `${version}`,
    tag: `test-${version}`,
    host: staticUrls.test,
    apiHost: staticUrlsAPI.test || defaultHostAPI,
    env: 'test',
    sso: sso.test,
    replicas: 1,
    maxReplicas: 1
  },
  prod: {
    namespace: '7068ad-prod',
    name: `${name}`,
    phase: 'prod',
    changeId: deployChangeId,
    suffix: `-prod`,
    instance: `${name}-prod`,
    version: `${version}`,
    tag: `prod-${version}`,
    host: staticUrls.prod,
    apiHost: staticUrlsAPI.prod || defaultHostAPI,
    env: 'prod',
    sso: sso.prod,
    replicas: 1,
    maxReplicas: 1
  }
};

// This callback forces the node process to exit as failure.
process.on('unhandledRejection', (reason) => {
  console.log(reason);
  process.exit(1);
});

module.exports = exports = { phases, options, staticBranches };
