export const DOCUMENT_ALLOWED_EXTENSIONS = [
  'pdf',
  'odt',
  'ods',
  'odp',
  'docx',
  'xlsx',
  'pptx',
  'jpg',
  'jpeg',
  'png',
  'webp',
  'mp4',
  'webm',
  'mp3',
  'ogg',
] as const;

export type DocumentAllowedExtension =
  (typeof DOCUMENT_ALLOWED_EXTENSIONS)[number];

export const DOCUMENT_MAX_FILE_SIZE_MB = 20;
export const DOCUMENT_MAX_FILE_SIZE_BYTES =
  DOCUMENT_MAX_FILE_SIZE_MB * 1024 * 1024;

export const DOCUMENT_ACCEPT_ATTRIBUTE = DOCUMENT_ALLOWED_EXTENSIONS.map(
  (extension) => `.${extension}`,
).join(',');

export const DOCUMENT_FILE_RULES = {
  allowedExtensions: DOCUMENT_ALLOWED_EXTENSIONS,
  accept: DOCUMENT_ACCEPT_ATTRIBUTE,
  maxSizeMB: DOCUMENT_MAX_FILE_SIZE_MB,
  maxSizeBytes: DOCUMENT_MAX_FILE_SIZE_BYTES,
} as const;
