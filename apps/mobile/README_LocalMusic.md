# 本地音乐资源获取指南

本文档介绍在 React Native 音频播放应用中获取本地音乐资源的几种方法。

## 方法一：使用 require() 加载打包资源

### 适用场景
- 应用内置的示例音频
- 固定的背景音乐或音效
- 不需要动态加载的音频文件

### 使用方法

1. **将音频文件放入 assets 目录**
   ```
   apps/mobile/assets/
   ├── sample-music-1.mp3
   ├── sample-music-2.mp3
   └── album-cover-1.jpg
   ```

2. **在代码中使用 require() 引用**
   ```typescript
   const track: Track = {
     id: 'local-track-1',
     url: require('@/assets/sample-music-1.mp3'), // 本地音频文件
     title: '本地音乐示例',
     artwork: require('@/assets/album-cover-1.jpg'), // 本地封面图片
     artist: '本地艺术家',
   }
   ```

### 优点
- 文件与应用一起打包，无需网络连接
- 加载速度快
- 适合固定资源

### 缺点
- 增加应用体积
- 不能动态添加内容
- 不适合大量音频文件

## 方法二：使用 expo-media-library 访问设备音乐库

### 适用场景
- 访问用户设备上已有的音乐
- 构建类似音乐播放器的应用
- 需要读取设备音乐库的元数据

### 安装依赖
```bash
npx expo install expo-media-library
```

### 权限配置

**Android (android/app/src/main/AndroidManifest.xml):**
```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />
```

**iOS (ios/flow/Info.plist):**
```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>此应用需要访问媒体库来播放您的音乐</string>
```

### 使用示例
```typescript
import { getLocalMusicTracks } from '@/utils/localMusicService'

// 获取设备音乐库中的音频文件
async function loadLocalMusic() {
  const tracks = await getLocalMusicTracks()
  console.log(`找到 ${tracks.length} 首本地音乐`)
}
```

### 可用功能
- `getLocalMusicTracks()` - 获取所有音频文件
- `getMusicAlbums()` - 获取音频相册列表
- `getMusicFromAlbum(albumId)` - 获取特定相册的音频
- `getAudioFileInfo(assetId)` - 获取音频文件详细信息

### 优点
- 可以访问设备上所有音乐
- 支持获取音频元数据
- 不增加应用体积

### 缺点
- 需要用户授权
- API 限制（某些元数据可能不可用）
- 平台差异性

## 方法三：使用 expo-document-picker 选择音频文件

### 适用场景
- 让用户从文件系统选择特定音频文件
- 支持各种音频格式
- 用户主动导入音频内容

### 安装依赖
```bash
npx expo install expo-document-picker
```

### 使用示例
```typescript
import { pickAudioFiles } from '@/utils/localMusicService'

// 让用户选择音频文件
async function selectAudioFiles() {
  const tracks = await pickAudioFiles()
  console.log(`用户选择了 ${tracks.length} 个音频文件`)
}
```

### 优点
- 用户完全控制选择哪些文件
- 支持多种音频格式
- 不需要特殊权限
- 可以选择云存储中的文件

### 缺点
- 需要用户手动操作
- 无法批量导入
- 文件路径可能是临时的

## 实际应用示例

在播放器组件中，我们结合了多种方法：

```typescript
// 播放列表支持混合资源类型
const playlist: Track[] = [
  // 方法一：打包的本地资源
  {
    id: 'bundled-track',
    url: require('@/assets/sample-music.mp3'),
    title: '内置音乐',
    artwork: require('@/assets/cover.jpg'),
    artist: '应用内置',
  },
  // 方法二：设备音乐库
  {
    id: 'device-track',
    url: 'file:///path/to/device/music.mp3',
    title: '设备音乐',
    artwork: 'https://placeholder.com/cover.jpg',
    artist: '设备艺术家',
  },
  // 方法三：用户选择的文件
  {
    id: 'picked-track',
    url: 'file:///path/to/picked/music.mp3',
    title: '用户选择',
    artwork: 'https://placeholder.com/cover.jpg',
    artist: '用户导入',
  },
]
```

## 注意事项

### 1. 音频格式支持
确保音频格式与平台兼容：
- **通用格式**: MP3, AAC, WAV
- **iOS 额外支持**: ALAC, AIFF
- **Android 额外支持**: OGG, FLAC

### 2. 权限处理
```typescript
// 检查并请求权限
const hasPermission = await requestMediaLibraryPermissions()
if (!hasPermission) {
  // 处理权限被拒绝的情况
  Alert.alert('权限需要', '需要访问媒体库权限来播放本地音乐')
}
```

### 3. 错误处理
```typescript
try {
  const tracks = await getLocalMusicTracks()
  // 处理成功情况
}
catch (error) {
  console.error('加载本地音乐失败:', error)
  // 向用户显示友好的错误信息
}
```

### 4. 性能优化
- 限制一次性加载的音频文件数量
- 使用分页加载大型音乐库
- 缓存常用的音频文件信息

## 总结

选择合适的方法取决于您的具体需求：

- **应用内置音频** → 使用 `require()`
- **访问设备音乐库** → 使用 `expo-media-library`
- **用户选择特定文件** → 使用 `expo-document-picker`

您也可以结合多种方法，为用户提供更灵活的音频来源选择。
