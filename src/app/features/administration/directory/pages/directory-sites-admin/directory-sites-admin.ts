import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import {
  lucideCircleAlert,
  lucideEllipsisVertical,
  lucideMapPin,
  lucidePencil,
  lucidePlus,
  lucideSearch,
  lucideTrash2,
} from '@ng-icons/lucide';
import {
  HlmAlertDialog,
  HlmAlertDialogImports,
} from '@spartan-ng/helm/alert-dialog';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HlmBadge } from '@spartan-ng/helm/badge';

import { DirectorySiteEditor, DirectorySiteEditorContext } from '../../dialogs';
import { DirectoryDataSource } from '../../services';
import { DirectorySite } from '../../interfaces';

@Component({
  selector: 'app-directory-sites-admin',
  imports: [
    FormsModule,
    HlmDropdownMenuImports,
    HlmAlertDialogImports,
    HlmInputGroupImports,
    HlmButtonImports,
    HlmSelectImports,
    HlmTableImports,
    HlmSpinner,
    HlmBadge,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideEllipsisVertical,
      lucideCircleAlert,
      lucideMapPin,
      lucidePencil,
      lucideTrash2,
      lucideSearch,
      lucidePlus,
    }),
  ],
  templateUrl: './directory-sites-admin.html',
})
export default class DirectorySitesAdmin {
  private readonly dataSource = inject(DirectoryDataSource);
  private readonly dialogService = inject(HlmDialogService);

  readonly sitesResource = rxResource({
    stream: () => this.dataSource.findSites(),
  });

  readonly sitePendingDelete = signal<DirectorySite | null>(null);

  readonly searchTerm = signal('');
  readonly isActiveFilter = signal<boolean | null>(null);

  readonly filteredSites = computed(() => {
    const term = this.searchTerm().trim().toLocaleLowerCase('es');
    const isActive = this.isActiveFilter();
    const items = this.sitesResource.value() ?? [];

    return items.filter(
      (site) =>
        (isActive === null || site.isActive === isActive) &&
        (!term || site.name.toLocaleLowerCase('es').includes(term)),
    );
  });

  openEditor(trigger: HTMLElement, site?: DirectorySite): void {
    const context: DirectorySiteEditorContext = { site };
    const dialogRef = this.dialogService.open<
      DirectorySite,
      DirectorySiteEditorContext
    >(DirectorySiteEditor, {
      showCloseButton: false,
      disableClose: true,
      autoFocus: false,
      restoreFocus: trigger,
      contentClass: 'w-[calc(100vw-2rem)] sm:!max-w-[480px]',
      context,
    });

    dialogRef.closed$.subscribe((result) => {
      if (result) this.sitesResource.reload();
    });
  }

  selectForDeletion(site: DirectorySite): void {
    this.sitePendingDelete.set(site);
  }

  confirmRemove(deleteDialog: HlmAlertDialog): void {
    const site = this.sitePendingDelete();
    if (!site) return;

    this.dataSource.removeSite(site.id).subscribe(() => {
      deleteDialog.close();
      this.sitesResource.reload();
    });
  }

  onDeleteDialogClosed(): void {
    this.sitePendingDelete.set(null);
  }
}
