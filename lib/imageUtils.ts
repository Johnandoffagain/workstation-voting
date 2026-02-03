import { supabase } from './supabase'

type ImageSize = 'thumb' | 'medium' | 'full'

const transformConfigs = {
  thumb: {
    width: 200,
    height: 200,
    quality: 75,
  },
  medium: {
    width: 1200,
    quality: 85,
  },
  full: {
    width: 2400,
    quality: 90,
  },
}

export function getPhotoUrl(path: string, size: ImageSize = 'medium'): string {
  const { data } = supabase.storage
    .from('workstation-photos')
    .getPublicUrl(path, {
      transform: transformConfigs[size],
    })

  return data.publicUrl
}
