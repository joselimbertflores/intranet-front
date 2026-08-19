export interface PortalDirectorySiteResponse {
  id: number;
  name: string;
  latitude: number | null;
  longitude: number | null;
}

export interface PortalDirectoryEntryResponse {
  id: number;
  areaName: string;
  contactLabel: string | null;
  extensions: string[];
  phones: string[];
  email: string | null;
  siteId: number | null;
  site: PortalDirectorySiteResponse | null;
  siteDetails: string | null;
}

export interface PortalAuthorityResponse {
  name: string;
  position: string;
  unit: string | null;
  area: string | null;
  level: number;
}
