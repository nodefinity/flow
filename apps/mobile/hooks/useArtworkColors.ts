import { useEffect, useState } from 'react'
import ImageColors from 'react-native-image-colors'
import { useColors } from './useColors'

export interface ArtworkGradientColors {
  dominant: string
  vibrant: string
  muted: string
  background: string
}

export function useArtworkColors(artworkUrl?: string) {
  const colors = useColors()

  const fallback: ArtworkGradientColors = {
    dominant: colors.primary,
    vibrant: colors.secondary,
    muted: colors.muted,
    background: colors.card,
  }

  const [artworkColors, setArtworkColors] = useState<ArtworkGradientColors>(fallback)

  useEffect(() => {
    if (!artworkUrl) {
      setArtworkColors(fallback)
      return
    }

    ImageColors.getColors(artworkUrl, { cache: true }).then((result) => {
      if (result.platform === 'android') {
        setArtworkColors({
          dominant: result.dominant || result.vibrant || colors.primary,
          vibrant: result.vibrant || result.dominant || colors.secondary,
          muted: result.muted || result.lightMuted || colors.muted,
          background: result.lightMuted || result.average || colors.card,
        })
      }
      else if (result.platform === 'ios') {
        setArtworkColors({
          dominant: result.primary || colors.primary,
          vibrant: result.secondary || colors.secondary,
          muted: result.detail || colors.muted,
          background: result.background || colors.card,
        })
      }
    }).catch(() => setArtworkColors(fallback))
  }, [artworkUrl])

  return artworkColors
}
