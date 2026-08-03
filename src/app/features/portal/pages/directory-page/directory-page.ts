import {
  ChangeDetectionStrategy,
  Component,
  computed,
  debounced,
  effect,
  inject,
  linkedSignal,
  signal,
  untracked,
} from '@angular/core';
import { FormField, FormRoot, form } from '@angular/forms/signals';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Params, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCheck,
  lucideCircleAlert,
  lucideContactRound,
  lucideCopy,
  lucideMail,
  lucideMapPin,
  lucidePhone,
  lucideRefreshCw,
  lucideSearch,
  lucideX,
} from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmSpinner } from '@spartan-ng/helm/spinner';

import { PublicPageHeader } from '../../components';
import { PortalDirectoryEntryResponse } from '../../interfaces';
import { PortalDirectoryDataSource } from '../../services';

interface DirectoryFiltersModel {
  siteId: number | null;
}

interface DirectoryQueryState {
  term: string;
  siteId: number | null;
}

interface DirectoryAreaGroup {
  areaName: string;
  entries: PortalDirectoryEntryResponse[];
}

interface DirectorySiteGroup {
  key: string;
  name: string;
  areas: DirectoryAreaGroup[];
}

@Component({
  selector: 'app-directory-page',
  imports: [
    FormField,
    FormRoot,
    HlmBadgeImports,
    HlmButtonImports,
    HlmFieldImports,
    HlmInputGroupImports,
    HlmSelectImports,
    HlmSkeletonImports,
    HlmSpinner,
    NgIcon,
    PublicPageHeader,
  ],
  providers: [
    provideIcons({
      lucideCheck,
      lucideCircleAlert,
      lucideContactRound,
      lucideCopy,
      lucideMail,
      lucideMapPin,
      lucidePhone,
      lucideRefreshCw,
      lucideSearch,
      lucideX,
    }),
  ],
  templateUrl: './directory-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DirectoryPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dataSource = inject(PortalDirectoryDataSource);
  private readonly queryParamMap = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  readonly entriesResource = this.dataSource.entriesResource;
  readonly sitesResource = this.dataSource.sitesResource;
  readonly sites = computed(() => this.sitesResource.value() ?? []);
  readonly siteNames = computed(
    () => new Map(this.sites().map(({ id, name }) => [id, name])),
  );
  readonly skeletonRows = Array.from({ length: 8 });
  readonly copiedValue = signal<string | null>(null);

  private readonly rawQueryState = computed(() =>
    this.parseQueryState(this.queryParamMap()),
  );
  readonly queryState = computed<DirectoryQueryState>(() => {
    const state = this.rawQueryState();
    const siteId = this.sites().some(({ id }) => id === state.siteId)
      ? state.siteId
      : null;
    return { ...state, siteId };
  });
  readonly searchTerm = linkedSignal(() => this.rawQueryState().term);
  private readonly debouncedSearchTerm = debounced(this.searchTerm, 300);
  readonly filtersModel = linkedSignal<DirectoryFiltersModel>(() => ({
    siteId: this.queryState().siteId,
  }));
  readonly filtersForm = form(this.filtersModel);

  readonly hasActiveFilters = computed(
    () => Boolean(this.queryState().term) || this.queryState().siteId !== null,
  );
  readonly filteredEntries = computed(() => {
    const entries = this.entriesResource.value() ?? [];
    const { term, siteId } = this.queryState();
    const normalizedTerm = this.normalizeForSearch(term);

    return entries.filter((entry) => {
      if (siteId !== null && entry.siteId !== siteId) return false;
      if (!normalizedTerm) return true;

      return this.searchableValues(entry).some((value) =>
        this.normalizeForSearch(value).includes(normalizedTerm),
      );
    });
  });
  readonly groupedEntries = computed<DirectorySiteGroup[]>(() =>
    this.groupEntries(this.filteredEntries()),
  );
  readonly isInitialLoading = computed(
    () => this.entriesResource.isLoading() && !this.entriesResource.hasValue(),
  );
  readonly isUpdating = computed(
    () => this.entriesResource.isLoading() && this.entriesResource.hasValue(),
  );

  constructor() {
    effect(() => {
      const term = this.normalizeTerm(this.debouncedSearchTerm.value());
      const state = this.queryState();
      if (term === state.term) return;
      untracked(() => this.navigateToState({ ...state, term }, true));
    });

    effect(() => {
      const paramMap = this.queryParamMap();
      if (!this.sitesResource.hasValue()) return;
      const state = this.queryState();
      const params = this.toQueryParams(state);
      if (this.queryParamsMatch(paramMap, params)) return;
      untracked(() => this.navigateToState(state, true));
    });
  }

  onSearchInput(event: Event): void {
    const input = event.target;
    if (input instanceof HTMLInputElement) this.searchTerm.set(input.value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.navigateToState({ ...this.queryState(), term: '' }, true);
  }

  selectSite(siteId: number | null | undefined): void {
    this.navigateToState(
      { ...this.queryState(), siteId: siteId ?? null },
      true,
    );
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.navigateToState({ term: '', siteId: null }, true);
  }

  reloadDirectory(): void {
    this.dataSource.reload();
  }

  reloadSites(): void {
    this.dataSource.reloadSites();
  }

  copyToken(entryId: number, kind: 'phone' | 'extension', value: string): string {
    return `${entryId}:${kind}:${value}`;
  }

  async copyValue(token: string, value: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      this.copiedValue.set(token);
      window.setTimeout(() => {
        if (this.copiedValue() === token) this.copiedValue.set(null);
      }, 1600);
    } catch {
      this.copiedValue.set(null);
    }
  }

  phoneHref(phone: string): string {
    return `tel:${phone.replace(/[^\d+]/g, '')}`;
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

  private groupEntries(
    entries: PortalDirectoryEntryResponse[],
  ): DirectorySiteGroup[] {
    const siteGroups = new Map<
      string,
      { name: string; areas: Map<string, PortalDirectoryEntryResponse[]> }
    >();

    for (const entry of entries) {
      const siteKey = entry.site ? String(entry.site.id) : 'without-site';
      const siteName = entry.site?.name ?? 'Sin sede especificada';
      const siteGroup = siteGroups.get(siteKey) ?? {
        name: siteName,
        areas: new Map<string, PortalDirectoryEntryResponse[]>(),
      };
      const areaEntries = siteGroup.areas.get(entry.areaName) ?? [];
      areaEntries.push(entry);
      siteGroup.areas.set(entry.areaName, areaEntries);
      siteGroups.set(siteKey, siteGroup);
    }

    return [...siteGroups.entries()]
      .sort(([, left], [, right]) => left.name.localeCompare(right.name, 'es'))
      .map(([key, group]) => ({
        key,
        name: group.name,
        areas: [...group.areas.entries()]
          .sort(([left], [right]) => left.localeCompare(right, 'es'))
          .map(([areaName, areaEntries]) => ({ areaName, entries: areaEntries })),
      }));
  }

  private parseQueryState(paramMap: ParamMap): DirectoryQueryState {
    const parsedSiteId = Number(paramMap.get('site'));
    return {
      term: this.normalizeTerm(paramMap.get('q')).slice(0, 255),
      siteId:
        Number.isInteger(parsedSiteId) && parsedSiteId > 0
          ? parsedSiteId
          : null,
    };
  }

  private normalizeTerm(value: string | null | undefined): string {
    return value?.replace(/\s+/g, ' ').trim() ?? '';
  }

  private normalizeForSearch(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('es')
      .trim();
  }

  private toQueryParams(state: DirectoryQueryState): Params {
    const params: Params = {};
    if (state.term) params['q'] = state.term;
    if (state.siteId !== null) params['site'] = state.siteId;
    return params;
  }

  private queryParamsMatch(paramMap: ParamMap, params: Params): boolean {
    const currentKeys = paramMap.keys.filter(
      (key) => paramMap.get(key) !== null && paramMap.get(key) !== '',
    );
    const nextKeys = Object.keys(params);
    return (
      currentKeys.length === nextKeys.length &&
      nextKeys.every((key) => paramMap.get(key) === String(params[key]))
    );
  }

  private navigateToState(state: DirectoryQueryState, replaceUrl: boolean): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.toQueryParams(state),
      replaceUrl,
      scroll: 'manual',
    });
  }
}
