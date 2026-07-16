import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';


import { DirectoryEntryResponse } from '../../../administration/directory/interfaces';
import { SearchInput } from '../../../../shared';
import { PublicSectionHeader } from '../../components';
import { PortalDirectoryDataSource } from '../../services';

@Component({
  selector: 'app-directory-page',
  imports: [
    FormsModule,
   
    SearchInput,
    PublicSectionHeader,
  ],
  templateUrl: './directory-page.html',
  styles: `
    .directory-list {
      box-shadow: 0 18px 50px -42px color-mix(in srgb, var(--p-primary-900) 55%, transparent);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DirectoryPage {
  private readonly dataSource = inject(PortalDirectoryDataSource);

  readonly sites = this.dataSource.sites;
  readonly term = signal('');
  readonly selectedSiteId = signal<number | null>(null);
  readonly copiedNumber = signal<string | null>(null);
  readonly skeletonItems = Array.from({ length: 6 }, (_, index) => index);

  readonly directoryResource = rxResource({
    params: () => ({ term: this.term(), siteId: this.selectedSiteId() }),
    stream: ({ params }) => this.dataSource.findAll(params),
  });

  readonly entries = computed<DirectoryEntryResponse[]>(() => {
    if (!this.directoryResource.hasValue()) return [];
    return this.directoryResource.value();
  });

  search(term: string): void {
    this.term.set(term);
  }

  selectSite(siteId: number | null): void {
    this.selectedSiteId.set(siteId);
  }

  async copyNumber(value: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      this.copiedNumber.set(value);
      window.setTimeout(() => {
        if (this.copiedNumber() === value) this.copiedNumber.set(null);
      }, 1600);
    } catch {
      this.copiedNumber.set(null);
    }
  }
}
