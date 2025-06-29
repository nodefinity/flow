import { useEffect, useState } from 'react'
import ImageColors from 'react-native-image-colors'
import { useTheme } from 'react-native-paper'

export interface ArtworkGradientColors {
  dominant: string // 主导色：从专辑封面提取的最主要颜色
  vibrant: string // 鲜艳色：高饱和度的活力颜色
  muted: string // 柔和色：低饱和度的温和颜色
  background: string // 背景色：最淡的背景颜色
}

export function useArtworkColors(artworkUrl?: string) {
  const [colors, setColors] = useState<ArtworkGradientColors>({
    dominant: '',
    vibrant: '',
    muted: '',
    background: '',
  })

  const { colors: themeColors } = useTheme()

  useEffect(() => {
    if (!artworkUrl) {
      // 没有封面时使用主题默认颜色
      setColors({
        dominant: themeColors.primary,
        vibrant: themeColors.secondary,
        muted: themeColors.outline,
        background: themeColors.elevation.level1,
      })
      return
    }

    ImageColors.getColors(artworkUrl, {
      cache: true,
    }).then((result) => {
      if (result.platform === 'android') {
        setColors({
          dominant: result.dominant || result.vibrant || themeColors.primary,
          vibrant: result.vibrant || result.dominant || themeColors.secondary,
          muted: result.muted || result.lightMuted || themeColors.outline,
          background: result.lightMuted || result.average || themeColors.elevation.level1,
        })
      }
      else if (result.platform === 'ios') {
        setColors({
          dominant: result.primary || themeColors.primary,
          vibrant: result.secondary || themeColors.secondary,
          muted: result.detail || themeColors.outline,
          background: result.background || themeColors.elevation.level1,
        })
      }
    }).catch((err) => {
      console.error('Failed to get image colors:', err, 'artworkUrl:', artworkUrl)
      // 出错时使用主题默认颜色
      setColors({
        dominant: themeColors.primary,
        vibrant: themeColors.secondary,
        muted: themeColors.outline,
        background: themeColors.elevation.level1,
      })
    })
  }, [artworkUrl, themeColors])

  return colors
}
