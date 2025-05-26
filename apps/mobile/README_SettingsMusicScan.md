# 设置页面音乐扫描功能使用指南

## 功能概述

在设置页面中新增了音乐扫描功能，用户可以通过两种方式添加本地音乐：

1. **扫描本地音乐** - 自动扫描设备音乐库
2. **选择音频文件** - 手动选择特定音频文件

## 功能位置

设置页面 → 播放设置 → 音乐扫描选项

## 使用方法

### 1. 扫描本地音乐

**功能说明：** 自动扫描设备中的音乐库，获取所有音频文件

**使用步骤：**
1. 打开应用设置页面
2. 找到"播放"设置部分
3. 点击"扫描本地音乐"
4. 首次使用时会请求媒体库访问权限
5. 授权后自动扫描设备音乐文件
6. 扫描完成后显示找到的音乐数量

**权限要求：**
- Android: `READ_EXTERNAL_STORAGE` 或 `READ_MEDIA_AUDIO`
- iOS: 媒体库访问权限

### 2. 选择音频文件

**功能说明：** 让用户手动从文件系统选择特定的音频文件

**使用步骤：**
1. 打开应用设置页面
2. 找到"播放"设置部分
3. 点击"选择音频文件"
4. 系统会打开文件选择器
5. 选择一个或多个音频文件
6. 确认选择后文件会被添加到播放列表

**支持格式：**
- MP3, AAC, WAV (通用格式)
- ALAC, AIFF (iOS)
- OGG, FLAC (Android)

## 技术实现

### 组件结构

```
设置页面 (setting.tsx)
├── MusicScanButton 组件
├── 本地音乐服务 (localMusicService.ts)
└── 音乐存储服务 (musicStorage.ts)
```

### 数据流程

1. **扫描音乐**
   ```
   用户点击 → MusicScanButton → localMusicService → 返回音乐列表
   ```

2. **保存音乐**
   ```
   音乐列表 → musicStorage → AsyncStorage → 本地存储
   ```

3. **去重处理**
   ```
   新音乐 → 检查现有音乐 → 过滤重复 → 保存唯一音乐
   ```

### 存储机制

- **存储位置：** AsyncStorage
- **存储键：** `localTracks`
- **数据格式：** JSON 字符串
- **去重策略：** 基于音乐 ID 去重

## 代码示例

### 扫描音乐的基本用法

```typescript
import { getLocalMusicTracks } from '@/utils/localMusicService'
import { addLocalTracks } from '@/utils/musicStorage'

// 扫描并保存音乐
async function scanAndSaveMusic() {
  try {
    const tracks = await getLocalMusicTracks()
    await addLocalTracks(tracks)
    console.log(`保存了 ${tracks.length} 首音乐`)
  }
  catch (error) {
    console.error('扫描失败:', error)
  }
}
```

### 读取已保存的音乐

```typescript
import { loadLocalTracks } from '@/utils/musicStorage'

// 加载本地音乐
async function loadMusic() {
  const tracks = await loadLocalTracks()
  console.log(`加载了 ${tracks.length} 首本地音乐`)
  return tracks
}
```

## 用户界面

### 扫描按钮状态

- **正常状态：** 显示功能名称和描述
- **扫描中：** 显示加载指示器
- **完成状态：** 显示扫描结果弹窗

### 反馈信息

- **成功：** "扫描完成，找到 X 首音乐文件"
- **无结果：** "未找到本地音乐文件或权限被拒绝"
- **错误：** "扫描音乐时发生错误，请重试"

## 注意事项

### 权限处理

1. **首次使用** - 会自动请求必要权限
2. **权限被拒绝** - 显示友好提示信息
3. **权限检查** - 每次扫描前都会检查权限状态

### 性能考虑

1. **扫描限制** - 默认限制扫描 100 首音乐
2. **去重机制** - 避免重复添加相同音乐
3. **异步处理** - 所有操作都是异步的，不会阻塞 UI

### 错误处理

1. **网络错误** - 本地操作，不依赖网络
2. **存储错误** - 有完整的错误捕获和日志
3. **权限错误** - 友好的权限提示

## 扩展功能

### 未来可能的增强

1. **批量管理** - 批量删除、编辑音乐信息
2. **分类管理** - 按艺术家、专辑分类
3. **同步功能** - 与云存储同步
4. **播放统计** - 记录播放次数和偏好

### 自定义配置

可以通过修改以下参数来自定义扫描行为：

```typescript
// 在 localMusicService.ts 中
const assets = await MediaLibrary.getAssetsAsync({
  mediaType: MediaLibrary.MediaType.audio,
  first: 100, // 修改扫描数量限制
  sortBy: [MediaLibrary.SortBy.modificationTime], // 修改排序方式
})
```

## 故障排除

### 常见问题

1. **扫描不到音乐**
   - 检查设备是否有音乐文件
   - 确认权限已正确授予
   - 重启应用重试

2. **权限被拒绝**
   - 到系统设置中手动开启权限
   - 重新安装应用

3. **扫描速度慢**
   - 减少扫描数量限制
   - 清理设备存储空间

### 调试信息

所有操作都有详细的控制台日志，可以通过开发者工具查看：

```
音乐扫描完成，找到 X 首歌曲: [音乐列表]
已保存 X 首本地音乐
添加了 X 首新音乐，总计 X 首
```
