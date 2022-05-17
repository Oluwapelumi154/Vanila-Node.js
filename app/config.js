/** create and config Environment variables */

const environments = {
  staging: {
    port: 3000,
    envName: 'staging',
    hashingSecret: '',
  },

  production: {
    port: 5000,
    envName: 'production',
    hashingSecret: '',
  },
};

const currentEnvironment = typeof process.env.NODE_ENV == 'string' ? process.env.NODE_ENV.toLowerCase() : '';
const environmentToExport =
  typeof environments[currentEnvironment] == 'object'
    ? environments[currentEnvironment]
    : environments.staging;
module.exports = environmentToExport;
