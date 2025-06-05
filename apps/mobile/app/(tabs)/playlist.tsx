// import type { AudioProTrack } from 'react-native-audio-pro'

import { Text, View } from 'react-native'

// // import Slider from '@react-native-community/slider'

// import type { Track } from '@/constants/PlayList'
// import { useEffect, useState } from 'react'
// import {
//   ActivityIndicator,
//   Image,
//   SafeAreaView,
//   ScrollView,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native'

// import { AudioPro, AudioProState, useAudioPro } from 'react-native-audio-pro'
// import { playlist } from '@/constants/PlayList'
// import { styles } from '@/constants/Styles'
// import { formatTime, getStateColor } from '@/utils/color'
// import { getLocalMusicTracks, pickAudioFiles } from '@/utils/localMusicService'
// import {
//   getCurrentTrackIndex,
//   getProgressInterval,
//   setCurrentTrackIndex,
//   setProgressInterval,
// } from '@/utils/palyService'

// export default function App() {
//   const [currentIndex, setLocalIndex] = useState(getCurrentTrackIndex())
//   const [progressInterval, setLocalProgressInterval] = useState(getProgressInterval())
//   const [currentPlaylist, setCurrentPlaylist] = useState<Track[]>(playlist)
//   const [isLoadingLocalMusic, setIsLoadingLocalMusic] = useState(false)
//   const [isPickingFiles, setIsPickingFiles] = useState(false)
//   const currentTrack = currentPlaylist[currentIndex]
//   const { position, duration, state, playingTrack, playbackSpeed, volume, error } = useAudioPro()
//   const [ambientState, setAmbientState] = useState<'stopped' | 'playing' | 'paused'>('stopped')

//   console.log('position', AudioPro)

//   // 加载本地音乐文件
//   const handleLoadLocalMusic = async () => {
//     setIsLoadingLocalMusic(true)
//     try {
//       const localTracks = await getLocalMusicTracks()
//       if (localTracks.length > 0) {
//         // 将本地音乐添加到播放列表的开始
//         const combinedPlaylist = [...localTracks, ...playlist]
//         setCurrentPlaylist(combinedPlaylist)
//         console.log(`加载了 ${localTracks.length} 首本地音乐`)
//       }
//       else {
//         console.log('未找到本地音乐文件或权限被拒绝')
//       }
//     }
//     catch (error) {
//       console.error('加载本地音乐时出错:', error)
//     }
//     finally {
//       setIsLoadingLocalMusic(false)
//     }
//   }

//   // 选择音频文件
//   const handlePickAudioFiles = async () => {
//     setIsPickingFiles(true)
//     try {
//       const pickedTracks = await pickAudioFiles()
//       if (pickedTracks.length > 0) {
//         // 将选择的音频文件添加到播放列表
//         const combinedPlaylist = [...currentPlaylist, ...pickedTracks]
//         setCurrentPlaylist(combinedPlaylist)
//         console.log(`添加了 ${pickedTracks.length} 个音频文件`)
//       }
//     }
//     catch (error) {
//       console.error('选择音频文件时出错:', error)
//     }
//     finally {
//       setIsPickingFiles(false)
//     }
//   }

//   // Sync the local index with the player service
//   useEffect(() => {
//     const index = getCurrentTrackIndex()
//     if (index !== currentIndex) {
//       setLocalIndex(index)
//       // Mark that we need to load the track if it changed
//       if (state !== AudioProState.PLAYING) {
//         setNeedsTrackLoad(true)
//       }
//     }
//   }, [state]) // Re-sync when playback state changes

//   // Reset needsTrackLoad when the track actually changes
//   useEffect(() => {
//     if (playingTrack?.id === currentTrack?.id) {
//       setNeedsTrackLoad(false)
//     }
//   }, [playingTrack?.id])

//   // Set up ambient audio event listeners
//   useEffect(() => {
//     // Add ambient audio event listeners
//     const ambientListener = AudioPro.addAmbientListener((event) => {
//       console.log('Ambient audio event:', event.type)

//       switch (event.type) {
//         case 'AMBIENT_TRACK_ENDED':
//           console.log('Ambient track ended')
//           // Update state if loop is false and track ended
//           setAmbientState('stopped')
//           break

//         case 'AMBIENT_ERROR':
//           console.warn('Ambient error:', event.payload?.error)
//           // Update state on error
//           setAmbientState('stopped')
//           break
//       }
//     })

//     // Clean up listeners when component unmounts
//     return () => {
//       ambientListener.remove()
//     }
//   }, [])

//   // Update both local state and player service when changing tracks
//   const updateCurrentIndex = (index: number) => {
//     setLocalIndex(index)
//     setCurrentTrackIndex(index)
//   }

//   // Track whether we need to load a new track before playing
//   const [needsTrackLoad, setNeedsTrackLoad] = useState(true)

//   // Track whether to autoPlay when loading a track
//   const [autoPlay, setAutoPlay] = useState(true)

//   if (!currentTrack)
//     return null

//   // Handle play/pause button press
//   const handlePlayPause = () => {
//     if (state === AudioProState.PLAYING) {
//       // If playing, simply pause
//       AudioPro.pause()
//     }
//     else if (state === AudioProState.PAUSED && !needsTrackLoad) {
//       // If paused and we don't need to load a new track, resume
//       AudioPro.resume()
//     }
//     else {
//       // If stopped, or we need to load a new track, play the current track
//       AudioPro.play(currentTrack as AudioProTrack, {
//         autoPlay,
//         // startTimeMs: 60000,
//       })
//       setNeedsTrackLoad(false)
//     }
//   }

//   const handleStop = () => {
//     AudioPro.stop()
//     setNeedsTrackLoad(true)
//   }

//   const handleClear = () => {
//     AudioPro.clear()
//     setNeedsTrackLoad(true)
//   }

//   const handleSeekBack = () => {
//     AudioPro.seekBack()
//   }

//   const handleSeekForward = () => {
//     AudioPro.seekForward()
//   }

//   const handlePrevious = () => {
//     if (position > 5000) {
//       // If we're more than 5 seconds into the track, seek to beginning
//       AudioPro.seekTo(0)
//     }
//     else {
//       // Otherwise, go to previous track
//       const newIndex = currentIndex > 0 ? currentIndex - 1 : currentPlaylist.length - 1

//       // Update the track index
//       updateCurrentIndex(newIndex)

//       // If we're currently playing or paused (but loaded), immediately load the new track
//       if (state === AudioProState.PLAYING || state === AudioProState.PAUSED) {
//         AudioPro.play(currentPlaylist[newIndex] as AudioProTrack, {
//           autoPlay,
//         })
//         setNeedsTrackLoad(false)
//       }
//       else {
//         // Otherwise, mark that we need to load the track when play is pressed
//         setNeedsTrackLoad(true)
//       }
//     }
//   }

//   const handleNext = () => {
//     const newIndex = (currentIndex + 1) % currentPlaylist.length
//     updateCurrentIndex(newIndex)

//     // If we're currently playing or paused (but loaded), immediately load the new track
//     if (state === AudioProState.PLAYING || state === AudioProState.PAUSED) {
//       AudioPro.play(currentPlaylist[newIndex] as AudioProTrack, { autoPlay })
//       setNeedsTrackLoad(false)
//     }
//     else {
//       // Otherwise, mark that we need to load the track when play is pressed
//       setNeedsTrackLoad(true)
//     }
//   }

//   const handleIncreaseSpeed = () => {
//     const newSpeed = Math.min(2.0, playbackSpeed + 0.25)
//     AudioPro.setPlaybackSpeed(newSpeed)
//   }

//   const handleDecreaseSpeed = () => {
//     const newSpeed = Math.max(0.25, playbackSpeed - 0.25)
//     AudioPro.setPlaybackSpeed(newSpeed)
//   }

//   const handleIncreaseVolume = () => {
//     const newVolume = Math.min(1.0, volume + 0.1)
//     AudioPro.setVolume(newVolume)
//   }

//   const handleDecreaseVolume = () => {
//     const newVolume = Math.max(0.0, volume - 0.1)
//     AudioPro.setVolume(newVolume)
//   }

//   // These handlers adjust how frequently progress events are emitted (in ms)
//   // Changes take effect on the next call to play()
//   const handleIncreaseProgressInterval = () => {
//     const newInterval = Math.min(10000, progressInterval + 100)
//     setProgressInterval(newInterval)
//     setLocalProgressInterval(newInterval)
//   }

//   const handleDecreaseProgressInterval = () => {
//     const newInterval = Math.max(100, progressInterval - 100)
//     setProgressInterval(newInterval)
//     setLocalProgressInterval(newInterval)
//   }

//   // Handle ambient audio playback
//   const handleAmbientPlay = () => {
//     // Play ambient audio from local file
//     AudioPro.ambientPlay({
//       url: require('@/assets/ambient-spring-forest-323801.mp3'),
//       loop: true,
//     })
//     setAmbientState('playing')
//   }

//   // Handle ambient audio stop
//   const handleAmbientStop = () => {
//     // Stop ambient audio
//     AudioPro.ambientStop()
//     setAmbientState('stopped')
//   }

//   // Toggle ambient audio pause/resume
//   const handleAmbientTogglePause = () => {
//     if (ambientState === 'playing') {
//       // Pause ambient audio
//       AudioPro.ambientPause()
//       setAmbientState('paused')
//     }
//     else if (ambientState === 'paused') {
//       // Resume ambient audio
//       AudioPro.ambientResume()
//       setAmbientState('playing')
//     }
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         <Image
//           source={
//             typeof currentTrack.artwork === 'number'
//               ? currentTrack.artwork
//               : { uri: currentTrack.artwork }
//           }
//           style={styles.artwork}
//         />
//         <Text style={styles.title}>{currentTrack.title}</Text>
//         <Text style={styles.artist}>{currentTrack.artist}</Text>
//         <View style={styles.sliderContainer}>
//           <Text style={styles.timeText}>{formatTime(position)}</Text>
//           {/* <Slider
//             style={styles.slider}
//             minimumValue={0}
//             maximumValue={duration}
//             value={position}
//             minimumTrackTintColor="#1EB1FC"
//             maximumTrackTintColor="#8E8E93"
//             thumbTintColor="#1EB1FC"
//             onSlidingComplete={handleSeek}
//           /> */}
//           <Text style={styles.timeText}>
//             {formatTime(Math.max(0, duration - position))}
//           </Text>
//         </View>
//         <View style={styles.controlsRow}>
//           <TouchableOpacity onPress={handlePrevious}>
//             <Text style={styles.controlText}>prev</Text>
//           </TouchableOpacity>
//           {state === AudioProState.LOADING
//             ? (
//                 <View style={styles.loadingContainer}>
//                   <ActivityIndicator size="large" color="#1EB1FC" />
//                 </View>
//               )
//             : (
//                 <TouchableOpacity onPress={handlePlayPause}>
//                   <Text style={styles.playPauseText}>
//                     {state === AudioProState.PLAYING
//                       ? 'pause()'
//                       : state === AudioProState.PAUSED && !needsTrackLoad
//                         ? 'resume()'
//                         : 'play(track)'}
//                   </Text>
//                 </TouchableOpacity>
//               )}
//           <TouchableOpacity onPress={handleNext}>
//             <Text style={styles.controlText}>next</Text>
//           </TouchableOpacity>
//         </View>
//         <View style={styles.seekRow}>
//           <TouchableOpacity onPress={handleSeekBack}>
//             <Text style={styles.controlText}>-30s</Text>
//           </TouchableOpacity>
//           <TouchableOpacity onPress={handleSeekForward}>
//             <Text style={styles.controlText}>+30s</Text>
//           </TouchableOpacity>
//         </View>
//         <View style={styles.speedRow}>
//           <TouchableOpacity onPress={handleDecreaseSpeed}>
//             <Text style={styles.controlText}>-</Text>
//           </TouchableOpacity>
//           <Text style={styles.speedText}>
//             Speed:
//             {playbackSpeed}
//             x
//           </Text>
//           <TouchableOpacity onPress={handleIncreaseSpeed}>
//             <Text style={styles.controlText}>+</Text>
//           </TouchableOpacity>
//         </View>
//         <View style={styles.generalRow}>
//           <View style={styles.speedRow}>
//             <TouchableOpacity onPress={handleDecreaseVolume}>
//               <Text style={styles.controlText}>-</Text>
//             </TouchableOpacity>
//             <Text style={styles.speedText}>
//               Vol:
//               {Math.round(volume * 100)}
//               %
//             </Text>
//             <TouchableOpacity onPress={handleIncreaseVolume}>
//               <Text style={styles.controlText}>+</Text>
//             </TouchableOpacity>
//           </View>
//           <View style={styles.speedRow}>
//             <TouchableOpacity onPress={handleDecreaseProgressInterval}>
//               <Text style={styles.controlText}>-</Text>
//             </TouchableOpacity>
//             <Text style={styles.speedText}>
//               Prog:
//               {progressInterval}
//               ms
//             </Text>
//             <TouchableOpacity onPress={handleIncreaseProgressInterval}>
//               <Text style={styles.controlText}>+</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//         <View style={styles.stopRow}>
//           <TouchableOpacity onPress={handleStop}>
//             <Text style={styles.controlText}>stop()</Text>
//           </TouchableOpacity>
//           <TouchableOpacity onPress={handleClear}>
//             <Text style={styles.controlText}>clear()</Text>
//           </TouchableOpacity>
//         </View>

//         <View style={styles.stopRow}>
//           <TouchableOpacity onPress={() => setAutoPlay(!autoPlay)}>
//             <Text style={styles.optionText}>
//               autoPlay:
//               {' '}
//               <Text style={{ color: autoPlay ? '#90EE90' : '#FFA500' }}>
//                 {autoPlay ? 'true' : 'false'}
//               </Text>
//             </Text>
//           </TouchableOpacity>
//           <Text style={styles.stateText}>
//             state:
//             {' '}
//             <Text style={{ color: getStateColor(state) }}>{state}</Text>
//           </Text>
//         </View>

//         <View style={styles.ambientSection}>
//           <Text style={styles.sectionTitle}>本地音乐</Text>
//           <View style={styles.stopRow}>
//             <TouchableOpacity onPress={handleLoadLocalMusic} disabled={isLoadingLocalMusic}>
//               {isLoadingLocalMusic
//                 ? (
//                     <ActivityIndicator size="small" color="#1EB1FC" />
//                   )
//                 : (
//                     <Text style={styles.controlText}>扫描音乐库</Text>
//                   )}
//             </TouchableOpacity>
//             {/* <TouchableOpacity onPress={handlePickAudioFiles} disabled={isPickingFiles}>
//               {isPickingFiles
//                 ? (
//                     <ActivityIndicator size="small" color="#1EB1FC" />
//                   )
//                 : (
//                     <Text style={styles.controlText}>选择文件</Text>
//                   )}
//             </TouchableOpacity> */}
//           </View>
//           <View style={styles.stopRow}>
//             <Text style={styles.speedText}>
//               播放列表:
//               {' '}
//               {currentPlaylist.length}
//               {' '}
//               首歌曲
//             </Text>
//           </View>
//         </View>

//         <View style={styles.ambientSection}>
//           <Text style={styles.sectionTitle}>Ambient Audio</Text>
//           <View style={styles.stopRow}>
//             {ambientState === 'stopped'
//               ? (
//                   <TouchableOpacity onPress={handleAmbientPlay}>
//                     <Text style={styles.controlText}>ambientPlay()</Text>
//                   </TouchableOpacity>
//                 )
//               : (
//                   <TouchableOpacity onPress={handleAmbientTogglePause}>
//                     <Text style={styles.controlText}>
//                       {ambientState === 'playing'
//                         ? 'ambientPause()'
//                         : 'ambientResume()'}
//                     </Text>
//                   </TouchableOpacity>
//                 )}
//             <TouchableOpacity onPress={handleAmbientStop}>
//               <Text style={styles.controlText}>ambientStop()</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {error && (
//           <View style={styles.errorContainer}>
//             <Text style={styles.errorText}>
//               Error:
//               {error.error}
//             </Text>
//           </View>
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   )
// }
export default function Playlist() {
  return (
    <View>
      <Text>PlayList</Text>
    </View>
  )
}
