import {
  inject,
  signal,
  Component,
  computed,
  debounced,
  linkedSignal,
} from '@angular/core';
import { disabled, form, FormField, FormRoot } from '@angular/forms/signals';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import {
  lucideEllipsisVertical,
  lucideCircleAlert,
  lucideRefreshCw,
  lucideDownload,
  lucideFilter,
  lucidePencil,
  lucidePlus,
  lucideSearch,
  lucideTrash2,
} from '@ng-icons/lucide';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  HlmAlertDialog,
  HlmAlertDialogImports,
} from '@spartan-ng/helm/alert-dialog';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmPopoverImports } from '@spartan-ng/helm/popover';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmSpinner } from '@spartan-ng/helm/spinner';

import {
  HierarchicalCombobox,
  PaginationControls,
  YearSelector,
} from '@app/shared';

import { DocumentCreate, DocumentEdit } from '../../dialogs';
import { DocumentResponse, DocumentValidityStatus } from '../../interfaces';
import { DocumentDataSource } from '../../services';

interface FilterData {
  organizationalUnitId: number | null;
  documentTypeId: number | null;
  documentSubtypeId: number | null;
  year: number | null;
  status: string | null;
  validityStatus: DocumentValidityStatus | null;
}

const EMPTY_FILTERS: Readonly<FilterData> = {
  organizationalUnitId: null,
  documentTypeId: null,
  documentSubtypeId: null,
  year: null,
  status: null,
  validityStatus: null,
};

@Component({
  selector: 'app-document-admin',
  imports: [
    FormsModule,
    FormField,
    FormRoot,
    NgIcon,
    HlmAlertDialogImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmDropdownMenuImports,
    HlmFieldImports,
    HlmInputGroupImports,
    HlmPopoverImports,
    HlmSelectImports,
    HlmSpinner,
    HlmTableImports,
    HlmTooltipImports,
    HierarchicalCombobox,
    PaginationControls,
    YearSelector,
  ],
  templateUrl: './document-admin.html',
  providers: provideIcons({
    lucideEllipsisVertical,
    lucideCircleAlert,
    lucideRefreshCw,
    lucideDownload,
    lucidePencil,
    lucideSearch,
    lucideTrash2,
    lucideFilter,
    lucidePlus,
  }),
})
export default class DocumentAdmin {
  private readonly documentDataSource = inject(DocumentDataSource);
  private readonly dialogService = inject(HlmDialogService);

  readonly documentTypes = toSignal(
    this.documentDataSource.getDocumentTypes(),
    { initialValue: [] },
  );
  readonly organizationalUnits = toSignal(
    this.documentDataSource.getOrganizationTree(),
    { initialValue: [] },
  );

  readonly pageSize = signal(10);
  readonly currentPage = signal(1);
  readonly offset = computed(() => this.pageSize() * (this.currentPage() - 1));

  readonly searchTerm = signal('');
  readonly debouncedSearchTerm = debounced(this.searchTerm, 300);

  readonly filterModel = signal<FilterData>({ ...EMPTY_FILTERS });
  readonly appliedFilters = signal<FilterData>({ ...EMPTY_FILTERS });

  readonly filterForm = form(this.filterModel, (schemaPath) => {
    disabled(schemaPath.documentSubtypeId, {
      when: ({ valueOf }) => {
        const typeId = valueOf(schemaPath.documentTypeId);
        return !this.documentTypes().some(
          ({ id, subtypes }) => id === typeId && subtypes.length > 0,
        );
      },
    });
  });

  readonly documentResource = rxResource({
    params: () => ({
      limit: this.pageSize(),
      offset: this.offset(),
      term: this.debouncedSearchTerm.value().trim(),
      ...this.appliedFilters(),
    }),
    stream: ({ params }) => this.documentDataSource.findAll(params),
  });

  readonly dataSource = linkedSignal(
    () => this.documentResource.value()?.documents ?? [],
  );
  readonly dataSize = linkedSignal(
    () => this.documentResource.value()?.total ?? 0,
  );
  readonly isListLoading = computed(
    () =>
      this.debouncedSearchTerm.isLoading() || this.documentResource.isLoading(),
  );

  readonly documentSubTypes = computed(() => {
    const selectedTypeId = this.filterForm.documentTypeId().value();
    return (
      this.documentTypes().find(({ id }) => id === selectedTypeId)?.subtypes ??
      []
    );
  });

  readonly documentSubtypeNames = computed(
    () => new Map(this.documentSubTypes().map(({ id, name }) => [id, name])),
  );
  readonly documentTypeNames = computed(
    () => new Map(this.documentTypes().map(({ id, name }) => [id, name])),
  );
  readonly statusOptions = [
    { value: 'ACTIVE', label: 'Activo' },
    { value: 'INACTIVE', label: 'Inactivo' },
  ];
  readonly statusNames = new Map(
    this.statusOptions.map(({ value, label }) => [value, label]),
  );
  readonly validityStatusOptions = [
    { value: DocumentValidityStatus.CURRENT, label: 'Vigentes' },
    { value: DocumentValidityStatus.HISTORICAL, label: 'Históricas' },
  ];
  readonly validityStatusNames = new Map(
    this.validityStatusOptions.map(({ value, label }) => [value, label]),
  );

  readonly appliedFiltersCount = computed(
    () =>
      Object.values(this.appliedFilters()).filter(
        (value) => value !== null && value !== undefined && value !== '',
      ).length,
  );
  readonly hasActiveQuery = computed(
    () =>
      this.appliedFiltersCount() > 0 ||
      this.debouncedSearchTerm.value().trim().length > 0,
  );

  protected readonly popoverState = signal<'open' | 'closed'>('closed');

  readonly documentPendingDelete = signal<DocumentResponse | null>(null);

  onSearch(term: string): void {
    this.currentPage.set(1);
    this.searchTerm.set(term);
  }

  onDocumentTypeChange(): void {
    this.filterForm.documentSubtypeId().value.set(null);
  }

  clearFilters(): void {
    const hadAppliedFilters = this.appliedFiltersCount() > 0;
    this.filterModel.set({ ...EMPTY_FILTERS });

    if (hadAppliedFilters) {
      this.appliedFilters.set({ ...EMPTY_FILTERS });
      this.currentPage.set(1);
    }

    this.popoverState.set('closed');
  }

  applyFilters(): void {
    this.appliedFilters.set({ ...this.filterModel() });
    this.currentPage.set(1);
    this.popoverState.set('closed');
  }

  reloadDocuments(): void {
    this.documentResource.reload();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialogService.open<DocumentResponse[]>(
      DocumentCreate,
      {
        showCloseButton: false,
        disableClose: true,
        contentClass: 'w-[calc(100vw-2rem)] sm:!max-w-[1200px]',
      },
    );

    dialogRef.closed$.subscribe((documents) => {
      if (documents?.length) {
        documents.forEach((item) => this.upsertItem(item));
      }
    });
  }

  openUpdateDialog(document: DocumentResponse): void {
    const dialogRef = this.dialogService.open<DocumentResponse>(DocumentEdit, {
      showCloseButton: false,
      disableClose: true,
      contentClass: 'w-[calc(100vw-2rem)] sm:!max-w-[800px]',
      context: { document },
    });

    dialogRef.closed$.subscribe((updatedDocument) => {
      if (updatedDocument) {
        this.upsertItem(updatedDocument);
      }
    });
  }

  confirmRemove(deleteDialog: HlmAlertDialog): void {
    const document = this.documentPendingDelete();
    if (!document) return;

    this.documentDataSource.removeDocument(document.id).subscribe(() => {
      this.removeItem(document.id);
      deleteDialog.close();
    });
  }

  downloadFile(url: string): void {
    const fileUrl = new URL(url);
    fileUrl.searchParams.set('download', 'true');
    window.open(fileUrl.toString(), '_blank', 'noopener,noreferrer');
  }

  selectDocumentForDeletion(document: DocumentResponse): void {
    this.documentPendingDelete.set(document);
  }

  onDeleteDialogClosed(): void {
    this.documentPendingDelete.set(null);
  }

  private upsertItem(newItem: DocumentResponse) {
    const exists = this.dataSource().some((item) => item.id === newItem.id);
    if (exists) {
      this.dataSource.update((values) =>
        values.map((item) => (item.id === newItem.id ? newItem : item)),
      );
      return;
    }
    this.dataSource.update((values) =>
      [newItem, ...values].slice(0, this.pageSize()),
    );
    this.dataSize.update((total) => (total += 1));
  }

  private removeItem(id: string): void {
    this.dataSource.update((values) => values.filter((item) => id !== item.id));

    const total = Math.max(0, this.dataSize() - 1);
    this.dataSize.set(total);

    const lastPage = Math.max(1, Math.ceil(total / this.pageSize()));

    if (this.currentPage() > lastPage) {
      this.currentPage.set(lastPage);
      return;
    }

    if (this.dataSource().length === 0 && total > 0) {
      this.documentResource.reload();
    }
  }
}
