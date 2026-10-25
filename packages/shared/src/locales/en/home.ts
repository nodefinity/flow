export default {
  title: 'Flow',
  chat: {
    sending: 'Writing a reply…',
    send: 'Send',
    configure: 'AI settings',
    retry: 'Retry reply',
    musicUnavailable: 'The music library is unavailable. Text chat is still available.',
    errors: {
      missingToken: 'Configure your DeepSeek token to start chatting.',
      storage: 'Could not read your token. Retry or open AI settings.',
      authentication: 'Your token is invalid or lacks access. Update it in settings.',
      quota: 'Your DeepSeek balance is insufficient. Check your account and retry.',
      rateLimit: 'Too many requests. Please try again later.',
      unavailable: 'The AI service is temporarily unavailable. Please try again later.',
      timeout: 'The reply timed out. Check your connection and retry.',
      emptyResponse: 'The AI returned no text. Please retry.',
      network: 'Could not get a reply. Check your connection and retry.',
      cancelled: 'The previous reply was paused. You can retry it.',
      replyAfterAction: 'Playback commands were issued, but the reply failed. Retrying only completes the reply without repeating playback commands.',
      openingNotPlayed: 'The AI found songs but did not start opening playback. Retry or request a song directly.',
    },
  },

  sections: {
    recentlyPlayed: 'Recently Played',
    forYou: 'For You',
    trending: 'Trending Now',
    newReleases: 'New Releases',
    recommended: 'Recommended for You',
    favorites: 'Favorites',
    playlists: 'Playlists',
  },

  actions: {
    play: 'Play',
    shuffle: 'Shuffle',
    addToQueue: 'Add to Queue',
    addToPlaylist: 'Add to Playlist',
    like: 'Like',
    download: 'Download',
  },

  emptyState: {
    noMusic: 'No music found',
    startExploring: 'Start exploring to find music you love',
  },
}
