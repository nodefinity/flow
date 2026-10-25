export default {
  title: 'Flow',
  chat: {
    sending: '正在回复…',
    send: '发送',
    configure: 'AI 配置',
    retry: '重试回复',
    musicUnavailable: '暂时无法读取音乐库，仍可进行文本对话。',
    errors: {
      missingToken: '配置 DeepSeek Token 后，就可以开始对话了。',
      storage: '暂时无法读取 Token，请重试或前往 AI 配置。',
      authentication: 'Token 无效或没有访问权限，请在设置中更新。',
      quota: 'DeepSeek 账户余额不足，请检查账户后重试。',
      rateLimit: '请求过于频繁，请稍后重试。',
      unavailable: 'AI 服务暂时不可用，请稍后重试。',
      timeout: '回复超时，请检查网络后重试。',
      emptyResponse: 'AI 没有返回文字，请重试。',
      network: '暂时无法获取回复，请检查网络后重试。',
      cancelled: '上一条回复已暂停，可以重试。',
      replyAfterAction: '播放操作已提交，但文字回复未完成。重试只补充回复，不会重复执行播放操作。',
      openingNotPlayed: 'AI 已找到歌曲，但没有完成开场播放。可以重试，或直接点歌。',
    },
  },

  sections: {
    recentlyPlayed: '最近播放',
    forYou: '为你推荐',
    trending: '热门榜单',
    newReleases: '新歌发布',
    recommended: '个性推荐',
    favorites: '我的收藏',
    playlists: '歌单',
  },

  actions: {
    play: '播放',
    shuffle: '随机播放',
    addToQueue: '添加到队列',
    addToPlaylist: '添加到歌单',
    like: '收藏',
    download: '下载',
  },

  emptyState: {
    noMusic: '没有找到音乐',
    startExploring: '开始探索发现你喜爱的音乐',
  },
}
