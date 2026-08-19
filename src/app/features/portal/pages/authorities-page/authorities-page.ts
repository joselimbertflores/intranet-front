import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmTableImports } from '@spartan-ng/helm/table';

import { PortalAuthorityResponse } from '../../interfaces';
import { PublicPageHeader } from '../../components';
import { PortalDirectoryDataSource } from '../../services';

@Component({
  selector: 'app-authorities-page',
  imports: [
    HlmButtonImports,
    HlmInputImports,
    HlmSkeletonImports,
    HlmTableImports,
    PublicPageHeader,
  ],
  host: { class: 'block' },
  templateUrl: './authorities-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AuthoritiesPage {
  private readonly directoryDataSource = inject(PortalDirectoryDataSource);

  readonly authoritiesResource = rxResource({
    stream: () => this.directoryDataSource.getAuthorities(),
  });
  readonly searchTerm = signal('');
  readonly filteredAuthorities = computed(() => {
    const authorities = this.authoritiesResource.value() ?? [];
    const term = this.normalize(this.searchTerm());

    if (!term) return authorities;

    return authorities.filter((authority) =>
      this.searchableValues(authority).some((value) =>
        this.normalize(value).includes(term),
      ),
    );
  });
  readonly skeletonItems = Array.from({ length: 9 });

  onSearchInput(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) this.searchTerm.set(target.value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }

  private searchableValues(authority: PortalAuthorityResponse): string[] {
    return [
      authority.name,
      authority.position,
      authority.unit ?? '',
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
