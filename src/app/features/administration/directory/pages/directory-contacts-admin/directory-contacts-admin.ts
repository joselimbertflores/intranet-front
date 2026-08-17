import {
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { form, FormField } from '@angular/forms/signals';

import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideEllipsisVertical,
  lucideCircleAlert,
  lucidePencil,
  lucideSearch,
  lucideTrash2,
  lucidePlus,
  lucideX,
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
import { HlmBadge } from '@spartan-ng/helm/badge';

import {
  DirectoryEntryEditor,
  DirectoryEntryEditorContext,
} from '../../dialogs';
import { DirectoryDataSource } from '../../services';
import { DirectoryEntry } from '../../interfaces';

interface DirectoryFiltersModel {
  term: string;
  siteId: number | null;
  isActive: boolean | null;
}

@Component({
  selector: 'app-directory-contacts-admin',
  imports: [
    FormField,
    HlmAlertDialogImports,
    HlmBadge,
    HlmButtonImports,
    HlmDropdownMenuImports,
    HlmInputGroupImports,
    HlmSelectImports,
    HlmTableImports,
    HlmSpinner,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideEllipsisVertical,
      lucideCircleAlert,
      lucideSearch,
      lucideTrash2,
      lucidePencil,
      lucidePlus,
      lucideX,
    }),
  ],
  templateUrl: './directory-contacts-admin.html',
})
export default class DirectoryContactsAdmin {
  private readonly dataSource = inject(DirectoryDataSource);
  private readonly dialogService = inject(HlmDialogService);

  readonly filtersModel = signal<DirectoryFiltersModel>({
    term: '',
    siteId: null,
    isActive: null,
  });
  readonly filtersForm = form(this.filtersModel);

  readonly sites = toSignal(this.dataSource.findSites(), {
    initialValue: [],
  });
  readonly siteNames = computed(
    () => new Map(this.sites().map(({ id, name }) => [id, name])),
  );

  readonly entriesResource = rxResource({
    stream: () => this.dataSource.findAll(),
  });
  readonly entries = linkedSignal(() => this.entriesResource.value() ?? []);
  readonly filteredEntries = computed(() => {
    const entries = this.entries();
    const { term, siteId, isActive } = this.filtersModel();
    const normalizedTerm = this.normalize(term);

    if (!normalizedTerm && siteId === null && isActive === null) return entries;

    return entries.filter((entry) => {
      if (siteId !== null && entry.siteId !== siteId) return false;
      if (isActive !== null && entry.isActive !== isActive) return false;
      if (!normalizedTerm) return true;

      return [
        entry.areaName,
        entry.contactLabel ?? '',
        entry.email ?? '',
        entry.site?.name ?? '',
        entry.siteDetails ?? '',
        ...entry.phones,
        ...entry.extensions,
      ].some((value) => this.normalize(value).includes(normalizedTerm));
    });
  });
  
  readonly hasFilters = computed(() => {
    const { term, siteId, isActive } = this.filtersModel();
    return term.trim().length > 0 || siteId !== null || isActive !== null;
  });

  readonly entryPendingDelete = signal<DirectoryEntry | null>(null);

  resetFilters(): void {
    this.filtersModel.set({ term: '', siteId: null, isActive: null });
  }

  openEditor(trigger: HTMLElement, entry?: DirectoryEntry): void {
    const context: DirectoryEntryEditorContext = {
      entry,
      sites: this.sites(),
    };
    const dialogRef = this.dialogService.open<
      DirectoryEntry,
      DirectoryEntryEditorContext
    >(DirectoryEntryEditor, {
      showCloseButton: false,
      disableClose: true,
      autoFocus: false,
      restoreFocus: trigger,
      contentClass: 'w-[calc(100vw-2rem)] sm:!max-w-[760px]',
      context,
    });

    dialogRef.closed$.subscribe((result) => {
      if (result) this.upsertItem(result);
    });
  }

  selectForDeletion(entry: DirectoryEntry): void {
    this.entryPendingDelete.set(entry);
  }

  confirmRemove(deleteDialog: HlmAlertDialog): void {
    const entry = this.entryPendingDelete();
    if (!entry) return;

    this.dataSource.remove(entry.id).subscribe(() => {
      this.removeItem(entry.id);
      deleteDialog.close();
    });
  }

  onDeleteDialogClosed(): void {
    this.entryPendingDelete.set(null);
  }

  private upsertItem(newItem: DirectoryEntry): void {
    const exists = this.entries().some((item) => item.id === newItem.id);

    if (exists) {
      this.entries.update((values) =>
        values.map((item) => (item.id === newItem.id ? newItem : item)),
      );
      return;
    }

    this.entries.update((values) => [newItem, ...values]);
  }

  private removeItem(id: number): void {
    this.entries.update((values) => values.filter((item) => item.id !== id));
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('es')
      .trim();
  }
}
