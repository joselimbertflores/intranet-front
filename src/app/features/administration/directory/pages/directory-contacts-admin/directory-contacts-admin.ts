import {
  signal,
  inject,
  Component,
  computed,
  debounced,
  linkedSignal,
} from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { form, FormField } from '@angular/forms/signals';

import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideEllipsisVertical,
  lucideCircleAlert,
  lucideRefreshCw,
  lucidePencil,
  lucideSearch,
  lucideTrash2,
  lucidePlus,
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
import { PaginationControls } from '../../../../../shared';
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
    PaginationControls,
    HlmSelectImports,
    HlmTableImports,
    HlmSpinner,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideEllipsisVertical,
      lucideCircleAlert,
      lucideRefreshCw,
      lucideSearch,
      lucideTrash2,
      lucidePencil,
      lucidePlus,
    }),
  ],
  templateUrl: './directory-contacts-admin.html',
})
export default class DirectoryContactsAdmin {
  private readonly dataSource = inject(DirectoryDataSource);
  private readonly dialogService = inject(HlmDialogService);

  readonly pageSize = signal(10);
  readonly currentPage = signal(1);
  readonly pageSizeOptions = [10, 25, 50];
  readonly offset = computed(() => this.pageSize() * (this.currentPage() - 1));

  readonly filtersModel = signal<DirectoryFiltersModel>({
    term: '',
    siteId: null,
    isActive: null,
  });
  readonly filtersForm = form(this.filtersModel);
  readonly debouncedFilters = debounced(this.filtersModel, 300);

  readonly sites = toSignal(this.dataSource.findSites(), {
    initialValue: [],
  });
  readonly siteNames = computed(
    () => new Map(this.sites().map(({ id, name }) => [id, name])),
  );

  readonly entriesResource = rxResource({
    params: () => ({
      limit: this.pageSize(),
      offset: this.offset(),
      term: this.debouncedFilters.value().term.trim(),
      siteId: this.debouncedFilters.value().siteId,
      isActive: this.debouncedFilters.value().isActive,
    }),
    stream: ({ params }) => this.dataSource.findAll(params),
  });

  readonly entries = linkedSignal(
    () => this.entriesResource.value()?.entries ?? [],
  );
  readonly total = linkedSignal(() => this.entriesResource.value()?.total ?? 0);
  readonly isListLoading = computed(
    () => this.debouncedFilters.isLoading() || this.entriesResource.isLoading(),
  );
  readonly hasFilters = computed(() => {
    const filters = this.filtersModel();
    return (
      filters.term.trim().length > 0 ||
      filters.siteId !== null ||
      filters.isActive !== null
    );
  });

  readonly entryPendingDelete = signal<DirectoryEntry | null>(null);

  onFiltersChange(): void {
    this.currentPage.set(1);
  }

  reloadEntries(): void {
    this.entriesResource.reload();
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

    this.entries.update((values) =>
      [newItem, ...values].slice(0, this.pageSize()),
    );
    this.total.update((value) => value + 1);
  }

  private removeItem(id: number): void {
    this.entries.update((values) => values.filter((item) => item.id !== id));

    const total = Math.max(0, this.total() - 1);
    this.total.set(total);

    const lastPage = Math.max(1, Math.ceil(total / this.pageSize()));
    if (this.currentPage() > lastPage) {
      this.currentPage.set(lastPage);
      return;
    }

    if (this.entries().length === 0 && total > 0) {
      this.entriesResource.reload();
    }
  }
}
