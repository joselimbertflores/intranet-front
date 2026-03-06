import {
  BannerResponse,
  QuickAccessResponse,
} from '../../../administration/content-settings/interfaces';
import { PortalDocumentResponse } from './document-response.interface';
import { PortalCommunicationResponse } from './portal-communication-response.interface';

export interface HomePortalDataResponse {
  banners: BannerResponse[];
  quickAccess: QuickAccessResponse[];
  communications: PortalCommunicationResponse[];
  documents: PortalDocumentResponse[];
}
