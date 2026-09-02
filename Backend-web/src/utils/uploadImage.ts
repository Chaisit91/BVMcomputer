import { createClient } from '@supabase/supabase-js'

// Secret key, not the publishable one — this runs server-side only and needs
// write access to the bucket regardless of RLS policies.
const supabase = createClient(process.env.SUPABASE_URL ?? '', process.env.SUPABASE_SECRET_KEY ?? '')

const BUCKET = 'images'

export async function uploadImage(path: string, file: Buffer, contentType: string) {
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType, upsert: true })
  if (error) throw error

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}
