import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBuilding2,
  lucideCircleAlert,
  lucideMapPinned,
} from '@ng-icons/lucide';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { forkJoin } from 'rxjs';

import { PublicPageHeader } from '../../components';
import { PortalDirectoryDataSource } from '../../services';
import { DirectoryList } from './components/directory-list/directory-list';
import { DirectoryMap } from './components/directory-map/directory-map';

type DirectoryTab = 'directory' | 'map';

@Component({
  selector: 'app-directory-page',
  imports: [
    DirectoryList,
    DirectoryMap,
    HlmSkeletonImports,
    HlmTabsImports,
    NgIcon,
    NgTemplateOutlet,
    PublicPageHeader,
  ],
  providers: [
    provideIcons({
      lucideBuilding2,
      lucideCircleAlert,
      lucideMapPinned,
    }),
  ],
  templateUrl: './directory-page.html',
})
export default class DirectoryPage {
  private readonly dataSource = inject(PortalDirectoryDataSource);

  readonly activeTab = signal<DirectoryTab>('directory');
  readonly directoryResource = rxResource({
    stream: () =>
      forkJoin({
        entries: this.dataSource.getEntries(),
        sites: this.dataSource.getSites(),
      }),
  });
  readonly sites = computed(() =>
    [...(this.directoryResource.value()?.sites ?? [])].sort((left, right) =>
      left.name.localeCompare(right.name, 'es'),
    ),
  );

  readonly skeletonRows = Array.from({ length: 7 });

  selectTab(tab: string): void {
    if (tab === 'directory' || tab === 'map') this.activeTab.set(tab);
  }
}
