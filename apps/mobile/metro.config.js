const path = require('node:path')
const { getDefaultConfig } = require('expo/metro-config')
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config')

const config = getDefaultConfig(__dirname)

const WEB_STUBS = {
  'react-native-pager-view': path.resolve(__dirname, 'stubs/react-native-pager-view.js'),
  '@nodefinity/react-native-music-library': path.resolve(__dirname, 'stubs/react-native-music-library.js'),
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

    if (platform === 'web') {
      // Skip if already a .web file
      if (!base.endsWith('.web')) {
        const webPath = `${base}.web${ext}`
        if (context.fileSystemLookup(webPath).exists) {
          return { ...result, filePath: webPath }
        }
      }
    }
    else {
      const mobilePath = `${base}.rn${ext}`
      if (context.fileSystemLookup(mobilePath).exists) {
        return { ...result, filePath: mobilePath }
      }
    }
  }
  return result
}

module.exports = wrapWithReanimatedMetroConfig(config)
