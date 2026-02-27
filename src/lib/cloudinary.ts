import { createHash } from "crypto";

type CloudinaryUploadResponse = {
  secure_url?: string;
  public_id?: string;
  error?: {
    message?: string;
  };
};

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const folder = process.env.CLOUDINARY_FOLDER;

function hasUsableUploadPreset() {
  if (!uploadPreset) return false;
  return uploadPreset !== "YOUR_UPLOAD_PRESET";
}

function assertCloudinaryUploadConfig() {
  if (!cloudName) {
    throw new Error("Missing Cloudinary config: CLOUDINARY_CLOUD_NAME is required.");
  }

  // Allow either unsigned upload (preset) or signed upload (api key + secret).
  if (!hasUsableUploadPreset() && (!apiKey || !apiSecret)) {
    throw new Error(
      "Missing Cloudinary config: set CLOUDINARY_UPLOAD_PRESET or CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET.",
    );
  }
}

function assertCloudinaryDestroyConfig() {
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Missing Cloudinary config for delete: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET are required.",
    );
  }
}

function buildUploadSignature(timestamp: number) {
  const parts: string[] = [];
  if (folder) {
    parts.push(`folder=${folder}`);
  }
  parts.push(`timestamp=${timestamp}`);

  const raw = `${parts.join("&")}${apiSecret}`;
  return createHash("sha1").update(raw).digest("hex");
}

export async function uploadImageToCloudinary(file: File) {
  assertCloudinaryUploadConfig();

  const data = new FormData();
  data.append("file", file);

  if (hasUsableUploadPreset()) {
    data.append("upload_preset", uploadPreset as string);
  } else {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = buildUploadSignature(timestamp);

    data.append("api_key", apiKey as string);
    data.append("timestamp", String(timestamp));
    data.append("signature", signature);
  }

  if (folder) {
    data.append("folder", folder);
  }

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: data,
  });

  const payload = (await response.json()) as CloudinaryUploadResponse;
  if (!response.ok || !payload.secure_url || !payload.public_id) {
    throw new Error(payload.error?.message ?? "Cloudinary upload failed");
  }

  return {
    secureUrl: payload.secure_url,
    publicId: payload.public_id,
  };
}

function buildDestroySignature(publicId: string, timestamp: number) {
  const raw = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  return createHash("sha1").update(raw).digest("hex");
}

export function extractPublicIdFromCloudinaryUrl(url: string | null | undefined) {
  if (!url || !url.includes("/image/upload/")) return null;

  const [, afterUpload] = url.split("/image/upload/");
  if (!afterUpload) return null;

  const withoutVersion = afterUpload.replace(/^v\d+\//, "");
  const segments = withoutVersion.split("/");
  const last = segments[segments.length - 1];
  if (!last) return null;

  segments[segments.length - 1] = last.replace(/\.[^.]+$/, "");
  return segments.join("/");
}

export async function deleteImageFromCloudinary(publicId: string) {
  assertCloudinaryDestroyConfig();

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = buildDestroySignature(publicId, timestamp);
  const data = new FormData();

  data.append("public_id", publicId);
  data.append("timestamp", String(timestamp));
  data.append("api_key", apiKey as string);
  data.append("signature", signature);

  await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: "POST",
    body: data,
  });
}
