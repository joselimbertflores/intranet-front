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

export interface DirectoryEntriesResponse {
  entries: DirectoryEntry[];
  total: number;
}

export interface DirectoryEntryFilters {
  limit: number;
  offset: number;
  term?: string;
  siteId?: number | null;
  isActive?: boolean | null;
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

export type DirectoryEntryResponse = DirectoryEntry;
