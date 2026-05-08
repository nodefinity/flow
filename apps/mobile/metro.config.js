const { getDefaultConfig } = require('expo/metro-config')
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config')

const config = getDefaultConfig(__dirname)

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const result = context.resolveRequest(context, moduleName, platform)
  if (result.type === 'sourceFile') {
    const lastDotIndex = result.filePath.lastIndexOf('.')
    const mobilePath = `${result.filePath.slice(0, lastDotIndex)}.rn${result.filePath.slice(lastDotIndex)}`
    const file = context.fileSystemLookup(mobilePath)
    if (file.exists) {
      return {
        ...result,
        filePath: mobilePath,
      }
    }
    else {
      return result
    }
  }
  return result
}

module.exports = wrapWithReanimatedMetroConfig(config)
