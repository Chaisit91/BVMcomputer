import { fromBuffer as detectFileType } from 'file-type'
import multer from 'multer'
import { ValidationError } from '../../lib/errors'
import { uploadImage } from '../../utils/uploadImage'
import type { IncomingAttachment } from './chat.repository'

// Chat is reachable from an unauthenticated public endpoint (customer side),
// so — unlike announcement attachments, which only a logged-in admin can
// upload — the allowed types are locked down to what a chat thread actually
// needs: images to look at, PDFs to review. Anything else is rejected before
// it reaches Supabase Storage.
// Also doubles as the extension map for the storage path below — deriving
// the extension from the verified mimetype (not the client-supplied
// originalname) means no client-controlled text ever ends up in the path.
const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
}

export const chatAttachmentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => {
    if (!(file.mimetype in ALLOWED_MIME_TYPES)) {
      cb(new ValidationError(`unsupported file type: ${file.mimetype}`))
      return
    }
    cb(null, true)
  },
})

// TODO (deferred — see conversation): run a real virus/malware scan on the
// buffer here too, once the storefront + AI/ML integration settles and a
// hosting target is picked. For a project at this stage, a free-tier cloud
// scanning API (e.g. Cloudmersive) is the pragmatic choice over self-hosted
// ClamAV — no daemon to run locally or in deploy, just one API key in .env.
// Until then, this only checks the file's real bytes against its declared
// type (below), which blocks "renamed .exe labeled image/png" but not a
// genuinely malicious image/PDF.

export async function uploadChatAttachments(
  conversationId: string,
  files: Express.Multer.File[],
): Promise<IncomingAttachment[]> {
  return Promise.all(
    files.map(async (file, index) => {
      // multer's fileFilter only checked the client-declared Content-Type,
      // which is trivially spoofable. This sniffs the real magic bytes and
      // rejects anything whose actual content doesn't match what it claims
      // to be — a renamed script disguised as "image/png" fails here even
      // though it already passed the declared-type check.
      // Pinned to file-type@16.x (not the current major) — later versions
      // are ESM-only and this project compiles to CommonJS.
      const detected = await detectFileType(file.buffer)
      if (!detected || detected.mime !== file.mimetype) {
        throw new ValidationError(`file content does not match its declared type: ${file.originalname}`)
      }

      const ext = ALLOWED_MIME_TYPES[file.mimetype] ?? 'bin'
      const path = `chat-attachments/${conversationId}-${Date.now()}-${index}.${ext}`
      const url = await uploadImage(path, file.buffer, file.mimetype)
      // fileName (shown to the user) is still the client-supplied originalname
      // — safe, it's rendered as text, never used as a path.
      return { url, fileName: file.originalname, contentType: file.mimetype, fileSizeBytes: file.size }
    }),
  )
}
