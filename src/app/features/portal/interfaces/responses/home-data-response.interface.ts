import { HeroSlideResponse, QuickAccessResponse } from '../../../administration/content-settings/interfaces';

export interface HomePortalDataResponse {
  slides: HeroSlideResponse[];
  quickAccess: QuickAccessResponse[];
  communications: any[];
  documents: any[];
}
