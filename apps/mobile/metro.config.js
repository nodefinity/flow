const path = require('node:path')
const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config')

const config = getDefaultConfig(__dirname)

const WEB_STUBS = {
  'react-native-pager-view': path.resolve(__dirname, 'stubs/react-native-pager-view.js'),
}

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && WEB_STUBS[moduleName]) {
    return { type: 'sourceFile', filePath: WEB_STUBS[moduleName] }
  }
  const result = context.resolveRequest(context, moduleName, platform)
  if (result.type === 'sourceFile') {
    const lastDotIndex = result.filePath.lastIndexOf('.')
    const ext = result.filePath.slice(lastDotIndex)
    const base = result.filePath.slice(0, lastDotIndex)

    const mobilePath = `${base}.rn${ext}`
    if (platform !== 'web' && context.fileSystemLookup(mobilePath).exists) {
      return { ...result, filePath: mobilePath }
    }
  }
  return result
}

module.exports = withNativeWind(wrapWithReanimatedMetroConfig(config), { input: './global.css' })
