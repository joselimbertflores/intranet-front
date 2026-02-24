export interface PortalCommunicationResponse {
  id: string;
  reference: string;
  type: string;
  createdAt: string;
  previewImageUrl?: string | null;
  code: string;
  attachment?: AttachmentCommunicationResponse;
}

export interface AttachmentCommunicationResponse {
  fileName: string;
  mimeType: string;
  url: string;
  size: number;
}
