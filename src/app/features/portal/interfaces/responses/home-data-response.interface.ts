import { BannerResponse, QuickAccessResponse } from '../../../administration/content-settings/interfaces';

export interface HomePortalDataResponse {
  slides: BannerResponse[];
  quickAccess: QuickAccessResponse[];
  communications: any[];
  documents: any[];
}
