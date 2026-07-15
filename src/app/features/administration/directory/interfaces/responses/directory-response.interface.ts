export interface DirectorySite {
  id: number;
  name: string;
  isActive: boolean;
}

export interface DirectoryEntryResponse {
  id: number;
  areaName: string;
  contactLabel: string | null;
  extensions: string[];
  phones: string[];
  email: string | null;
  siteId: number | null;
  site: DirectorySite | null;
  siteDetails: string | null;
  isActive: boolean;
}

export interface DirectoryEntryPayload {
  areaName: string;
  contactLabel?: string | null;
  extensions: string[];
  phones: string[];
  email?: string | null;
  siteId?: number | null;
  siteDetails?: string | null;
  isActive: boolean;
}

export interface DirectorySitePayload {
  name: string;
  isActive: boolean;
}
