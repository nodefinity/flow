export enum Language {
  English = 'en',
  Chinese = 'zh',
}

type Accent = 'mint' | 'coral' | 'cyan'

interface HeroHighlight {
  title: string
  body: string
}

interface FeatureCard extends HeroHighlight {
  accent: Accent
}

interface Channel {
  name: string
  state: string
  body: string
}

interface HostLine {
  time: string
  speaker: string
  body: string
  listener: boolean
}

interface ProgrammeCard extends HeroHighlight {}

export const defaultLanguage = Language.English

export const supportedLanguages = [
  Language.English,
  Language.Chinese,
] as const

export const landingCopy = {
  [Language.English]: {
    meta: {
      htmlLang: 'en',
      title: 'Flow - Private AI radio for your local library',
      description: 'Flow turns the music you already own into hosted radio channels, live AI host interludes, and calm listening programmes.',
    },
    header: {
      brandAriaLabel: 'Flow home',
      navAriaLabel: 'Primary navigation',
      languageAriaLabel: 'Language',
      nav: {
        radio: 'Radio',
        channels: 'Channels',
        host: 'Host',
        programme: 'Programme',
      },
      preview: 'Preview',
      joinResearch: 'Join research',
      languageOptions: {
        en: 'EN',
        zh: '中文',
      },
    },
    hero: {
      eyebrow: 'Private AI radio - research access open',
      title: 'Private AI radio for your local library',
      intro: 'Flow turns the music you already own into hosted channels, live programmes, and calm AI host interludes.',
      subcopy: 'Your songs stay local-first. Flow adds the feeling of a real radio station: current track, tuner controls, host transcript, and listener requests in one immersive surface.',
      primaryCta: 'Join research',
      secondaryCta: 'See radio concept',
      radioAlt: 'Flow radio hardware with dot-matrix speaker grille, ON AIR lamp, tuner display, waveform, channel buttons, and knobs.',
      phoneAlt: 'Flow mobile home screen showing the AI radio tuner, current song, playback controls, host transcript, and listener request chips.',
      capabilityAriaLabel: 'Flow capabilities',
      highlights: [
        {
          title: 'Channels',
          body: 'Curated from your own library',
        },
        {
          title: 'Host',
          body: 'AI interludes shown in real time',
        },
        {
          title: 'Programme',
          body: 'Sessions that feel like shows',
        },
      ] satisfies HeroHighlight[],
      features: [
        {
          title: 'Endless radio channels',
          body: 'Flow reshapes folders, albums, playlists, and forgotten tracks into living stations with their own pacing.',
          accent: 'mint',
        },
        {
          title: 'Visible AI host',
          body: 'The host introduces tracks, sets the mood, explains transitions, and keeps every spoken line readable.',
          accent: 'coral',
        },
        {
          title: 'Radio-style controls',
          body: 'Frequency, signal, tuner ticks, hardware buttons, and intervention chips replace generic player UI.',
          accent: 'cyan',
        },
      ] satisfies FeatureCard[],
    },
    channels: {
      eyebrow: 'Channels',
      title: 'Endless radio channels from your library',
      body: 'Flow reshapes folders, albums, playlists, and forgotten tracks into radio channels that feel alive.',
      items: [
        {
          name: 'Rain-night programme',
          state: 'Host speaking - Interlude 2/7',
          body: 'Soft rain outside. You inside. A quiet sequence with low host density and gentle transitions.',
        },
        {
          name: 'Deep Cuts',
          state: 'Archive scan - 42 tracks',
          body: 'Older local tracks are resurfaced with context, cleaner handoffs, and fewer repeated favorites.',
        },
        {
          name: 'Warm Signals',
          state: 'Evening channel - Live',
          body: 'A slower station for winding down, tuned for warm textures and relaxed pacing.',
        },
      ] satisfies Channel[],
    },
    host: {
      eyebrow: 'AI Host',
      title: 'A host that speaks between songs, not over them',
      body: 'The AI host introduces tracks, sets the mood, explains transitions, and responds when you want to change the energy.',
      transcriptLabel: 'Live transcript',
      transcriptTitle: 'Rain-night programme',
      lines: [
        {
          time: '00:12',
          speaker: 'Host',
          body: 'Soft rain outside. You inside.',
          listener: false,
        },
        {
          time: '00:18',
          speaker: 'Host',
          body: 'We will drift through something quiet and beautiful together.',
          listener: false,
        },
        {
          time: '01:02',
          speaker: 'You',
          body: 'Can you make it quieter?',
          listener: true,
        },
        {
          time: '01:04',
          speaker: 'Host',
          body: 'I will soften the next stretch. Lower the noise. More room to breathe.',
          listener: false,
        },
      ] satisfies HostLine[],
      interventions: [
        'More quiet',
        'Less talk',
        'Request a track',
      ],
    },
    interface: {
      eyebrow: 'Radio Interface',
      title: 'Designed like a station, not a generic player',
      body: 'Current song information, frequency-style tuning, signal meters, playback buttons, and host dialogue stay in one place.',
      items: [
        {
          title: 'ON AIR status',
          body: 'Clear broadcast state at the top of the experience.',
        },
        {
          title: 'Current frequency',
          body: 'Tuner scale and signal details give the app its radio identity.',
        },
        {
          title: 'Current song and artist',
          body: 'Track context stays visible without becoming an album-card layout.',
        },
        {
          title: 'Previous / pause / next',
          body: 'Playback controls feel like tactile radio buttons.',
        },
        {
          title: 'Host transcript',
          body: 'Frequent host speech stays compact and readable.',
        },
        {
          title: 'Listener intervention dock',
          body: 'Steer the room with visible chips instead of hidden voice commands.',
        },
      ] satisfies HeroHighlight[],
    },
    programme: {
      eyebrow: 'Programmes',
      title: 'Build sessions that feel intentionally hosted',
      body: 'Flow can turn your library into themed listening blocks with pacing, transitions, and context.',
      items: [
        {
          title: 'Rain-night listening',
          body: 'A soft station for late evenings, quiet rooms, and lower host density.',
        },
        {
          title: 'Morning commute',
          body: 'A concise show that keeps energy moving without turning into a feed.',
        },
        {
          title: 'Deep-cut archive hour',
          body: 'A hosted pass through music you own but have not touched in months.',
        },
        {
          title: 'Warm evening signals',
          body: 'A calm sequence with smoother transitions and fewer interruptions.',
        },
      ] satisfies ProgrammeCard[],
    },
    privacy: {
      eyebrow: 'Private by default',
      title: 'Your library is the source',
      body: 'Flow is designed around music you already own, not another public feed or discovery loop.',
      principles: [
        'Local-first library experience',
        'No social feed',
        'No forced recommendation stream',
        'AI host stays in service of listening',
      ],
    },
    research: {
      eyebrow: 'Research access',
      title: 'Help shape the private AI radio interface',
      body: 'We are testing Flow with listeners who care about local libraries, calm listening, AI hosting, and radio-style controls.',
      notes: [
        'Local library workflows',
        'iOS and Android',
        'No credit card',
      ],
    },
    form: {
      eyebrow: 'Research access',
      title: 'Join Flow\'s early research',
      emailLabel: 'Email',
      emailPlaceholder: 'you@example.com',
      platformLabel: 'Platform',
      platformOptions: {
        ios: 'iOS',
        android: 'Android',
        both: 'Both',
      },
      submit: 'Join research',
      feedback: 'Leave feedback without email',
      messages: {
        unavailable: 'Submission is unavailable right now. Please try again later.',
        pending: 'Submitting...',
        success: 'Received. We will contact you when research access opens.',
        error: 'Submission failed. Please check your email or try again later.',
      },
    },
    footer: {
      brandAriaLabel: 'Flow home',
      body: 'Private AI radio for local libraries, hosted programmes, and visible host conversations.',
      productAriaLabel: 'Product',
      researchAriaLabel: 'Research',
      principlesAriaLabel: 'Principles',
      productTitle: 'Product',
      researchTitle: 'Research',
      principlesTitle: 'Principles',
      productLinks: {
        radio: 'Radio layer',
        channels: 'Channels',
        interface: 'Interface',
      },
      researchLinks: {
        host: 'AI Host',
        join: 'Join research',
        feedback: 'Leave feedback',
      },
      principleLinks: {
        local: 'Local-first',
        private: 'Private by default',
        programme: 'Programme mode',
      },
    },
  },
  [Language.Chinese]: {
    meta: {
      htmlLang: 'zh-CN',
      title: 'Flow - 为本地曲库打造的私有 AI 电台',
      description: 'Flow 会把你已经拥有的音乐变成有人主持的电台频道、实时 AI 主持人串场和安静克制的听歌节目。',
    },
    header: {
      brandAriaLabel: 'Flow 首页',
      navAriaLabel: '主导航',
      languageAriaLabel: '语言',
      nav: {
        radio: '电台',
        channels: '频道',
        host: '主持人',
        programme: '节目',
      },
      preview: '预览',
      joinResearch: '参与研究',
      languageOptions: {
        en: 'EN',
        zh: '中文',
      },
    },
    hero: {
      eyebrow: '私有 AI 电台 - 研究体验开放',
      title: '为你的本地曲库打造私有 AI 电台',
      intro: 'Flow 会把你已经拥有的音乐变成有人主持的频道、实时节目和安静克制的 AI 主持人串场。',
      subcopy: '你的歌曲保持本地优先。Flow 加入真正电台的感觉：当前曲目、调谐控制、主持人字幕和听众请求集中在一个沉浸界面中。',
      primaryCta: '参与研究',
      secondaryCta: '查看电台概念',
      radioAlt: 'Flow 电台硬件概念图，包含点阵扬声器网格、ON AIR 灯、调谐显示、波形、频道按钮和旋钮。',
      phoneAlt: 'Flow 手机首页界面，展示 AI 电台调谐器、当前歌曲、播放控制、主持人字幕和听众请求按钮。',
      capabilityAriaLabel: 'Flow 能力',
      highlights: [
        {
          title: '频道',
          body: '从你的曲库策划而来',
        },
        {
          title: '主持人',
          body: 'AI 串场实时可见',
        },
        {
          title: '节目',
          body: '像广播节目一样的听歌时段',
        },
      ] satisfies HeroHighlight[],
      features: [
        {
          title: '不断生长的电台频道',
          body: 'Flow 会把文件夹、专辑、歌单和被遗忘的歌曲重组为有节奏、有呼吸感的电台频道。',
          accent: 'mint',
        },
        {
          title: '看得见的 AI 主持人',
          body: '主持人会介绍曲目、铺垫情绪、解释过渡，并让每一句串场都保持可读。',
          accent: 'coral',
        },
        {
          title: '电台式控制',
          body: '频率、信号、调谐刻度、硬件按钮和干预按钮，取代通用播放器界面。',
          accent: 'cyan',
        },
      ] satisfies FeatureCard[],
    },
    channels: {
      eyebrow: '频道',
      title: '从你的曲库生成持续播放的电台频道',
      body: 'Flow 会把文件夹、专辑、歌单和被遗忘的歌曲重组为有生命力的电台频道。',
      items: [
        {
          name: '雨夜节目',
          state: '主持人正在串场 - 第 2/7 段',
          body: '窗外有雨，你在室内。一个低主持密度、轻柔过渡的安静序列。',
        },
        {
          name: '深度曲库',
          state: '曲库扫描 - 42 首',
          body: '更早的本地歌曲会被重新带回耳边，带着上下文、更自然的衔接和更少重复。',
        },
        {
          name: '温暖信号',
          state: '夜间频道 - 直播中',
          body: '一个适合放慢速度的频道，调谐到温暖质感和舒缓节奏。',
        },
      ] satisfies Channel[],
    },
    host: {
      eyebrow: 'AI 主持人',
      title: '在歌曲之间说话，而不是盖过歌曲',
      body: 'AI 主持人会介绍曲目、铺垫情绪、解释过渡，并在你想改变能量时作出回应。',
      transcriptLabel: '实时字幕',
      transcriptTitle: '雨夜节目',
      lines: [
        {
          time: '00:12',
          speaker: '主持人',
          body: '窗外有雨，你在室内。',
          listener: false,
        },
        {
          time: '00:18',
          speaker: '主持人',
          body: '接下来我们一起慢慢进入安静又漂亮的一段。',
          listener: false,
        },
        {
          time: '01:02',
          speaker: '你',
          body: '可以再安静一点吗？',
          listener: true,
        },
        {
          time: '01:04',
          speaker: '主持人',
          body: '我会让下一段更柔和，降低噪声，留出更多呼吸空间。',
          listener: false,
        },
      ] satisfies HostLine[],
      interventions: [
        '更安静',
        '少说话',
        '点一首歌',
      ],
    },
    interface: {
      eyebrow: '电台界面',
      title: '像电台一样设计，而不是普通播放器',
      body: '当前歌曲信息、频率式调谐、信号表、播放按钮和主持人对话都停留在同一个界面里。',
      items: [
        {
          title: 'ON AIR 状态',
          body: '在体验顶部清楚显示当前播出状态。',
        },
        {
          title: '当前频率',
          body: '调谐刻度和信号细节让应用拥有明确的电台身份。',
        },
        {
          title: '当前歌曲与艺人',
          body: '曲目信息保持可见，但不会变成普通专辑卡片布局。',
        },
        {
          title: '上一首 / 暂停 / 下一首',
          body: '播放控制像实体电台按钮一样直接、可触。',
        },
        {
          title: '主持人字幕',
          body: '频繁出现的主持人发言保持紧凑且易读。',
        },
        {
          title: '听众干预按钮',
          body: '用可见按钮调整氛围，而不是把指令藏在语音命令里。',
        },
      ] satisfies HeroHighlight[],
    },
    programme: {
      eyebrow: '节目',
      title: '把听歌时段组织成有主持感的节目',
      body: 'Flow 可以把你的曲库变成带有主题、节奏、过渡和上下文的听歌段落。',
      items: [
        {
          title: '雨夜聆听',
          body: '适合深夜、安静房间和低主持密度的柔和频道。',
        },
        {
          title: '早晨通勤',
          body: '一个简洁的节目，让能量向前推进，但不会变成信息流。',
        },
        {
          title: '深度曲库一小时',
          body: '由主持人带你穿过那些拥有却几个月没听过的音乐。',
        },
        {
          title: '温暖夜间信号',
          body: '一个平静序列，过渡更顺，打断更少。',
        },
      ] satisfies ProgrammeCard[],
    },
    privacy: {
      eyebrow: '默认私有',
      title: '你的曲库就是来源',
      body: 'Flow 围绕你已经拥有的音乐设计，而不是另一个公共信息流或发现循环。',
      principles: [
        '本地优先的曲库体验',
        '没有社交信息流',
        '没有强制推荐流',
        'AI 主持人服务于聆听',
      ],
    },
    research: {
      eyebrow: '研究体验',
      title: '一起打磨私有 AI 电台界面',
      body: '我们正在邀请关心本地曲库、安静聆听、AI 主持和电台式控制的听众测试 Flow。',
      notes: [
        '本地曲库工作流',
        'iOS 和 Android',
        '不需要信用卡',
      ],
    },
    form: {
      eyebrow: '研究体验',
      title: '加入 Flow 早期研究',
      emailLabel: '邮箱',
      emailPlaceholder: 'you@example.com',
      platformLabel: '平台',
      platformOptions: {
        ios: 'iOS',
        android: 'Android',
        both: '都可以',
      },
      submit: '参与研究',
      feedback: '不留邮箱，直接反馈',
      messages: {
        unavailable: '暂时无法提交。请稍后再试。',
        pending: '正在提交...',
        success: '已收到。研究体验开放时我们会联系你。',
        error: '提交失败。请检查邮箱或稍后再试。',
      },
    },
    footer: {
      brandAriaLabel: 'Flow 首页',
      body: '为本地曲库、有人主持的节目和可见主持人对话打造的私有 AI 电台。',
      productAriaLabel: '产品',
      researchAriaLabel: '研究',
      principlesAriaLabel: '原则',
      productTitle: '产品',
      researchTitle: '研究',
      principlesTitle: '原则',
      productLinks: {
        radio: '电台层',
        channels: '频道',
        interface: '界面',
      },
      researchLinks: {
        host: 'AI 主持人',
        join: '参与研究',
        feedback: '留下反馈',
      },
      principleLinks: {
        local: '本地优先',
        private: '默认私有',
        programme: '节目模式',
      },
    },
  },
} as const

export type LandingCopy = (typeof landingCopy)[Language.English] | (typeof landingCopy)[Language.Chinese]
export type HeaderCopy = LandingCopy['header']
export type FooterCopy = LandingCopy['footer']
export type WaitlistFormCopy = LandingCopy['form']
