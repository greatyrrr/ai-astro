const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = withAndroidManifest(config => {
  const application = config.modResults.manifest.application[0];
  application.$['android:usesCleartextTraffic'] = 'true';
  return config;
});
