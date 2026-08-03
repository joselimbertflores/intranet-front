export interface PortalDirectorySiteResponse {
  id: number;
  name: string;
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
