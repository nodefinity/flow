import fs from 'node:fs'
import process from 'node:process'

const packageName = process.argv[2]

if (!packageName) {
  console.error('Please provide a package name')
  process.exit(1)
}

const packagePath = `packages/${packageName}`

if (fs.existsSync(packagePath)) {
  console.error(`📦 Package ${packageName} already exists`)
  process.exit(1)
}

const packageJson = {
  name: `@flow/${packageName}`,
  type: 'module',
  private: true,
  exports: {
    '.': './src/index.ts',
  },
  scripts: {
    typecheck: 'tsc --noEmit',
  },
  devDependencies: {
    '@flow/config': 'workspace:*',
  },
}

const tsconfigJson = {
  extends: '@flow/config/tsconfig.base.json',
  compilerOptions: {
    baseUrl: '.',
    paths: {
      [`@flow/${packageName}/*`]: ['./src/*'],
      '@pkg': ['../../package.json'],
    },
  },
  include: ['src/**/*'],
}

fs.mkdirSync(packagePath, { recursive: true })
fs.mkdirSync(`${packagePath}/src`, { recursive: true })
fs.writeFileSync(`${packagePath}/src/index.ts`, '')
fs.writeFileSync(`${packagePath}/package.json`, `${JSON.stringify(packageJson, null, 2)}\n`)
fs.writeFileSync(`${packagePath}/tsconfig.json`, `${JSON.stringify(tsconfigJson, null, 2)}\n`)

console.log(`📦 Package ${packageName} created successfully`)
