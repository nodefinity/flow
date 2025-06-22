const fs = require('node:fs')
const path = require('node:path')
const { getDefaultConfig } = require('expo/metro-config')

const projectRoot = __dirname
const monorepoRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

function getMonorepoPackages() {
  const packagesPath = path.resolve(monorepoRoot, 'packages')

  if (!fs.existsSync(packagesPath)) {
    return {}
  }

  const appPackageJson = fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8')
  const appPackage = JSON.parse(appPackageJson)

  const allDependencies = {
    ...appPackage.dependencies,
    ...appPackage.devDependencies,
  }

  const flowPackages = Object.keys(allDependencies).filter(pkg => pkg.startsWith('@flow/'))

  console.log('📦 App dependencies:', flowPackages)

  return flowPackages.reduce((acc, pkg) => {
    const pkgName = pkg.replace('@flow/', '')
    const pkgPath = path.join(packagesPath, pkgName)

    if (fs.existsSync(pkgPath)) {
      acc[pkg] = pkgPath
    }
    else {
      console.warn(`⚠️ Package ${pkg} not found at ${pkgPath}`)
    }

    return acc
  }, {})
}

const autoMonorepoPackages = getMonorepoPackages()

const manualMonorepoPackages = {
  // some special packages
  // '@flow/special': path.resolve(monorepoRoot, 'packages/special'),
}

const monorepoPackages = {
  ...autoMonorepoPackages,
  ...manualMonorepoPackages,
}

console.log('📦 Discovered packages:', Object.keys(monorepoPackages))

// 1. Watch the local app directory, and only the shared packages (limiting the scope and speeding it up)
// Note how we change this from `monorepoRoot` to `projectRoot`. This is part of the optimization!
config.watchFolders = [projectRoot, ...Object.values(monorepoPackages)]

// Add the monorepo workspaces as `extraNodeModules` to Metro.
// If your monorepo tooling creates workspace symlinks in the `node_modules` directory,
// you can either add symlink support to Metro or set the `extraNodeModules` to avoid the symlinks.
// See: https://metrobundler.dev/docs/configuration/#extranodemodules
config.resolver.extraNodeModules = monorepoPackages

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
]

// 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
config.resolver.disableHierarchicalLookup = true

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

module.exports = config
