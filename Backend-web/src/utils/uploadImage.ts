import { createClient } from '@supabase/supabase-js'

const BUCKET = 'images'

// Built lazily, not at module load — @supabase/supabase-js throws synchronously
// if the key is empty, which would crash the whole server at startup (this
// module gets imported even on routes that never call uploadImage) rather
// than failing only when someone actually tries to upload.
function getClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY
  if (!url || !key) {
    throw new Error('SUPABASE_URL / SUPABASE_SECRET_KEY is not set — image uploads are unavailable until it is.')
  }
  return createClient(url, key)
}

export async function uploadImage(path: string, file: Buffer, contentType: string) {
  const supabase = getClient()
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType, upsert: true })
  if (error) throw error

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}
