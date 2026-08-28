import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideContactRound,
  lucideMail,
  lucideMapPin,
  lucideSearch,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTableImports } from '@spartan-ng/helm/table';

import {
  PortalDirectoryEntryResponse,
  PortalDirectorySiteResponse,
} from '../../../../interfaces';

@Component({
  selector: 'app-directory-list',
  imports: [
    HlmButtonImports,
    HlmFieldImports,
    HlmInputGroupImports,
    HlmSelectImports,
    HlmTableImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideContactRound,
      lucideMail,
      lucideMapPin,
      lucideSearch,
    }),
  ],
  templateUrl: './directory-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DirectoryList {
  readonly entries = input.required<readonly PortalDirectoryEntryResponse[]>();
  readonly sites = input.required<readonly PortalDirectorySiteResponse[]>();

  readonly searchTerm = signal('');
  readonly selectedSiteId = signal<number | null>(null);

  readonly filteredEntries = computed(() => {
    const term = this.normalize(this.searchTerm());
    const siteId = this.selectedSiteId();

    return this.entries().filter((entry) => {
      if (siteId !== null && entry.siteId !== siteId) return false;
      if (!term) return true;

      return this.searchableValues(entry).some((value) =>
        this.normalize(value).includes(term),
      );
    });
  });

  readonly hasActiveFilters = computed(
    () => this.searchTerm().trim().length > 0 || this.selectedSiteId() !== null,
  );
  readonly siteNames = computed(
    () => new Map(this.sites().map((site) => [site.id, site.name])),
  );

  onSearchInput(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) this.searchTerm.set(target.value);
  }

  selectSite(siteId: number | null | undefined): void {
    this.selectedSiteId.set(siteId ?? null);
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.selectedSiteId.set(null);
  }

  phoneHref(phone: string): string {
    return `tel:${phone.replace(/[^\d+]/g, '')}`;
  }

  directionsHref(site: PortalDirectorySiteResponse): string {
    return `https://www.google.com/maps/dir/?api=1&destination=${site.latitude},${site.longitude}`;
  }

  private searchableValues(entry: PortalDirectoryEntryResponse): string[] {
    return [
      entry.areaName,
      entry.contactLabel ?? '',
      entry.email ?? '',
      entry.site?.name ?? '',
      entry.siteDetails ?? '',
      ...entry.extensions,
      ...entry.phones,
    ];
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('es')
      .trim();
  }
}
