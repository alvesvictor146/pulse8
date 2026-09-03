import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "";
const STORAGE_ENDPOINT = process.env.STORAGE_ENDPOINT || (R2_ACCOUNT_ID ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : undefined);
const STORAGE_REGION = process.env.STORAGE_REGION || "auto";
const STORAGE_ACCESS_KEY_ID = process.env.STORAGE_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || "";
const STORAGE_SECRET_ACCESS_KEY = process.env.STORAGE_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || "";
const STORAGE_BUCKET_NAME = process.env.STORAGE_BUCKET_NAME || "pulse8-assets";
const STORAGE_PUBLIC_URL = process.env.STORAGE_PUBLIC_URL || "https://assets.pulse8.app";

let s3ClientInstance: S3Client | null = null;

export function getS3Client(): S3Client {
  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({
      region: STORAGE_REGION,
      endpoint: STORAGE_ENDPOINT,
      credentials: {
        accessKeyId: STORAGE_ACCESS_KEY_ID || "mock-access-key",
        secretAccessKey: STORAGE_SECRET_ACCESS_KEY || "mock-secret-key",
      },
    });
  }
  return s3ClientInstance;
}

export type StorageFolder = "covers" | "receipts" | "marketing" | "attachments";

export interface GeneratePresignedUploadParams {
  filename: string;
  contentType: string;
  folder: StorageFolder;
  orgId: string;
  expiresInSeconds?: number;
}

export interface PresignedUploadResult {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  isMock: boolean;
}

export function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9.-]/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Gera URL pré-assinada para upload direto seguro do navegador para o Cloudflare R2 / S3
 */
export async function generatePresignedUploadUrl({
  filename,
  contentType,
  folder,
  orgId,
  expiresInSeconds = 300,
}: GeneratePresignedUploadParams): Promise<PresignedUploadResult> {
  const sanitized = sanitizeFilename(filename);
  const ext = sanitized.includes(".") ? sanitized.split(".").pop() : "bin";
  const uniqueId = randomUUID();
  const key = `${orgId}/${folder}/${uniqueId}.${ext}`;

  const publicUrl = `${STORAGE_PUBLIC_URL.replace(/\/$/, "")}/${key}`;

  // Se credenciais não estiverem configuradas no ambiente atual, retornar URL simulada segura
  if (!STORAGE_ACCESS_KEY_ID || !STORAGE_SECRET_ACCESS_KEY) {
    return {
      uploadUrl: `/api/upload/direct?key=${encodeURIComponent(key)}`,
      publicUrl,
      key,
      isMock: true,
    };
  }

  const s3 = getS3Client();
  const command = new PutObjectCommand({
    Bucket: STORAGE_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: expiresInSeconds,
  });

  return {
    uploadUrl,
    publicUrl,
    key,
    isMock: false,
  };
}

/**
 * Remove um objeto do bucket R2 / S3
 */
export async function deleteStorageObject(key: string): Promise<boolean> {
  if (!STORAGE_ACCESS_KEY_ID || !STORAGE_SECRET_ACCESS_KEY) {
    return true;
  }

  try {
    const s3 = getS3Client();
    await s3.send(
      new DeleteObjectCommand({
        Bucket: STORAGE_BUCKET_NAME,
        Key: key,
      })
    );
    return true;
  } catch (error) {
    console.error("Error deleting object from storage:", error);
    return false;
  }
}
