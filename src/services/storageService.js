import { supabase } from "../lib/supabase"

const BUCKET = "product-images"

const VIDEO_EXTS = ["mp4", "mov", "webm", "avi", "mkv"]
const IMAGE_EXTS = ["jpg", "jpeg", "png", "webp", "avif"]

export function isVideoUrl(url) {
  if (!url) return false
  const lower = url.toLowerCase().split("?")[0]
  return VIDEO_EXTS.some(ext => lower.endsWith("." + ext))
}

/**
 * Upload a single image or video file to Supabase Storage
 * Returns the public URL
 */
export async function uploadProductImage(file) {
  const ext = file.name.split(".").pop().toLowerCase()
  const isVideo = VIDEO_EXTS.includes(ext)
  const isImage = IMAGE_EXTS.includes(ext)

  if (!isVideo && !isImage) throw new Error("Only JPG, PNG, WEBP images or MP4/MOV/WEBM videos allowed")

  if (isImage && file.size > 5 * 1024 * 1024) throw new Error("Image must be under 5MB")
  if (isVideo && file.size > 50 * 1024 * 1024) throw new Error("Video must be under 50MB")

  const folder = isVideo ? "product-videos" : "products"
  const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
  const filePath = `${folder}/${fileName}`

  const { error } = await supabase.storage.from(BUCKET).upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  })
  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath)
  return data.publicUrl
}

/**
 * Upload multiple images/videos, returns array of public URLs
 */
export async function uploadProductImages(files) {
  const urls = []
  for (const file of files) {
    const url = await uploadProductImage(file)
    urls.push(url)
  }
  return urls
}

/**
 * Delete an image/video from storage by its public URL
 */
export async function deleteProductImage(publicUrl) {
  try {
    const marker = `/product-images/`
    const idx = publicUrl.indexOf(marker)
    if (idx === -1) return
    const filePath = publicUrl.slice(idx + marker.length)
    await supabase.storage.from(BUCKET).remove([filePath])
  } catch (e) {
    console.warn("Failed to delete file from storage:", e)
  }
}
