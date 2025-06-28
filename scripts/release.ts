import type { ReleaseType } from 'semver'
import { execSync } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import inquirer from 'inquirer'
import semver from 'semver'

async function release() {
  try {
    const { platform } = await inquirer.prompt([
      {
        type: 'list',
        name: 'platform',
        message: 'Select platform',
        choices: ['android', 'ios'],
      },
    ])

    const { releaseType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'releaseType',
        message: 'Select release type',
        choices: ['patch', 'minor', 'major'],
      },
    ])

    console.log(`🚀 Start building ${releaseType} version for ${platform} platform...`)

    const appJsonPath = path.join(process.cwd(), 'apps/mobile/app.json')
    const appJson = await fs.readFile(appJsonPath, 'utf8')
    const appConfig = JSON.parse(appJson)
    const currentVersion = appConfig.expo.version

    const newVersion = semver.inc(currentVersion, releaseType as ReleaseType)
    if (!newVersion) {
      throw new Error('Version calculation failed')
    }

    console.log(`📦 Current version: ${currentVersion} -> New version: ${newVersion}`)

    appConfig.expo.version = newVersion
    await fs.writeFile(appJsonPath, JSON.stringify(appConfig, null, 2))

    console.log(`🔨 Start building ${platform} application...`)
    const buildCommand = `eas build --profile production --platform ${platform} --local`
    console.log(`Execute command: ${buildCommand}`)

    try {
      execSync(buildCommand, {
        stdio: 'inherit',
        cwd: path.join(process.cwd(), 'apps/mobile'),
      })
    }
    catch (error) {
      console.error('❌ Build failed:', error)
      throw error
    }

    console.log('📝 Commit version update...')
    try {
      execSync('git add .', { stdio: 'inherit' })
      execSync(`git commit -m "chore: release ${newVersion}"`, { stdio: 'inherit' })
      execSync(`git tag v${newVersion}`, { stdio: 'inherit' })
      execSync('git push', { stdio: 'inherit' })
      execSync(`git push origin v${newVersion}`, { stdio: 'inherit' })
    }
    catch (error) {
      console.error('❌ Git operation failed:', error)
      throw error
    }

    // Find build file
    const buildDir = path.join(process.cwd(), 'apps/mobile')
    const files = await fs.readdir(buildDir)
    const buildFile = files.find((file) => {
      const isAndroid = platform === 'android' && file.endsWith('.apk')
      const isIOS = platform === 'ios' && file.endsWith('.ipa')
      return isAndroid || isIOS
    })

    if (!buildFile) {
      throw new Error(`Build file not found for ${platform}`)
    }

    const buildFilePath = path.join(buildDir, buildFile)
    console.log(`📁 Build file found: ${buildFile}`)

    console.log('🚀 Upload to GitHub Release...')

    // create GitHub Release
    console.log('📝 Creating GitHub Release...')
    const createReleaseCommand = `gh release create v${newVersion} --title "Release v${newVersion}" --notes "Release v${newVersion} for ${platform}" --repo nodefinity/flow`
    console.log(`Execute command: ${createReleaseCommand}`)

    try {
      execSync(createReleaseCommand, { stdio: 'inherit' })
      console.log('✅ GitHub Release created successfully')
    }
    catch (error) {
      console.error('❌ Failed to create GitHub Release:', error)
      throw error
    }

    // rename build file
    const fileExtension = platform === 'android' ? 'apk' : 'ipa'
    const newFileName = `flow_${platform}_v${newVersion}_release.${fileExtension}`
    const newFilePath = path.join(buildDir, newFileName)

    try {
      await fs.rename(buildFilePath, newFilePath)
      console.log(`📁 File renamed to: ${newFileName}`)
    }
    catch (error) {
      console.error('❌ Failed to rename build file:', error)
      throw error
    }

    // upload file to GitHub Release
    const uploadCommand = `gh release upload v${newVersion} "${newFilePath}" --repo nodefinity/flow`
    console.log(`Execute command: ${uploadCommand}`)

    try {
      execSync(uploadCommand, { stdio: 'inherit' })
      console.log('✅ File uploaded to GitHub Release successfully')
    }
    catch (error) {
      console.error('❌ GitHub Release upload failed:', error)
      throw error
    }

    // clean up build file
    await fs.rm(newFilePath, { force: true })

    console.log(`✅ Release successful! Version v${newVersion} uploaded to GitHub Release`)
    console.log(`🔗 View release: https://github.com/nodefinity/flow/releases/tag/v${newVersion}`)
  }
  catch (error) {
    console.error('❌ Release failed:', error)
    process.exit(1)
  }
}

release()
