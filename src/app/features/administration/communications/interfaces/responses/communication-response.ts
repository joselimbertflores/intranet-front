export interface CommunicationAdminResponse {
  id: string;
  reference: string;
  code: string;
  createdAt: string;
  isActive: boolean;
  eventId?: string;
  file: CommunicationFileResponse;
  type: CommunicationTypeResponse;
}

export interface CommunicationFileResponse {
  id: string;
  originalName: string;
  url: string;
}

export interface CommunicationTypeResponse {
  id: number;
  name: string;
}
