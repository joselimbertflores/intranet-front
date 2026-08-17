export interface DirectorySite {
  id: number;
  name: string;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
}

export interface DirectoryEntry {
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

