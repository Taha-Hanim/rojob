const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const isCloudinaryConfigured = Boolean(CLOUD && PRESET);

export async function uploadToCloudinary(file) {
  if (!isCloudinaryConfigured) {
    throw new Error("Cloudinary is not configured.");
  }
  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", PRESET);
  body.append("folder", "rojob");
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`,
    { method: "POST", body }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Upload failed");
  return data.secure_url;
}

export function imgSrc(url) {
  if (!url) return "/images/cable-vest-porcelain.jpg";
  return url;
}
