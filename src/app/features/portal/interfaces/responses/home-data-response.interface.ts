import {
  BannerResponse,
  QuickAccessResponse,
} from '../../../administration/content-settings/interfaces';
import { PortalDocumentResponse } from './document-response.interface';

export interface PortalCommunicationsResponse {
  id: string;
  reference: string;
  code: string;
  createdAt: string;
  isActive: string;
  type: string;
  previewUrl: string;
}
export interface HomePortalDataResponse {
  banners: BannerResponse[];
  quickAccess: QuickAccessResponse[];
  communications: PortalCommunicationsResponse[];
  documents: PortalDocumentResponse[];
}
