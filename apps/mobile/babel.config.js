// https://github.com/expo/expo/issues/30323#issuecomment-2813900851
module.exports = function (api) {
  api.cache(true)
  return {
    presets: [['babel-preset-expo', { unstable_transformImportMeta: true }]],
    plugins: [
      'react-native-paper/babel',
      'react-native-reanimated/plugin',
    ],
  }
}
