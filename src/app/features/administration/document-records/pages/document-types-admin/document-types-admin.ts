import {
  Component,
  computed,
  debounced,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideEllipsisVertical,
  lucidePencil,
  lucidePlus,
  lucideSearch,
  lucideTrash2,
} from '@ng-icons/lucide';
import {
  HlmAlertDialog,
  HlmAlertDialogImports,
} from '@spartan-ng/helm/alert-dialog';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { finalize } from 'rxjs';

import { PaginationControls } from '../../../../../shared';
import { DocumentTypeEditor } from '../../dialogs';
import { DocumentTypeWithSubTypesResponse } from '../../interfaces';
import { DocumentTypeDatasource } from '../../services';

@Component({
  selector: 'app-document-types-admin',
  imports: [
    FormsModule,
    HlmAlertDialogImports,
    HlmBadge,
    HlmButtonImports,
    HlmDropdownMenuImports,
    HlmInputGroupImports,
    HlmSpinner,
    HlmTableImports,
    NgIcon,
    PaginationControls,
  ],
  providers: [
    provideIcons({
      lucideEllipsisVertical,
      lucidePencil,
      lucidePlus,
      lucideSearch,
      lucideTrash2,
    }),
  ],
  templateUrl: './document-types-admin.html',
})
export default class DocumentTypesAdmin {
  private readonly documentTypeDataSource = inject(DocumentTypeDatasource);
  private readonly dialogService = inject(HlmDialogService);

  readonly pageSize = signal(10);
  readonly currentPage = signal(1);
  readonly offset = computed(() => this.pageSize() * (this.currentPage() - 1));
  readonly searchTerm = signal('');
  readonly debouncedSearchTerm = debounced(this.searchTerm, 300);

  readonly documentTypePendingDelete =
    signal<DocumentTypeWithSubTypesResponse | null>(null);
  readonly isDeleting = signal(false);
  readonly deleteError = signal<string | null>(null);

  readonly documentTypeResource = rxResource({
    params: () => ({
      offset: this.offset(),
      limit: this.pageSize(),
      term: this.debouncedSearchTerm.value().trim(),
    }),
    stream: ({ params }) =>
      this.documentTypeDataSource.findAll(
        params.limit,
        params.offset,
        params.term,
      ),
  });

  readonly dataSource = linkedSignal(
    () => this.documentTypeResource.value()?.data ?? [],
  );
  readonly dataSize = linkedSignal(
    () => this.documentTypeResource.value()?.total ?? 0,
  );
  readonly isListLoading = computed(
    () =>
      this.debouncedSearchTerm.isLoading() ||
      this.documentTypeResource.isLoading(),
  );

  onSearch(term: string): void {
    this.currentPage.set(1);
    this.searchTerm.set(term);
  }

  openDocumentTypeDialog(
    documentType?: DocumentTypeWithSubTypesResponse,
  ): void {
    const dialogRef =
      this.dialogService.open<DocumentTypeWithSubTypesResponse>(
        DocumentTypeEditor,
        {
          showCloseButton: false,
          disableClose: true,
          contentClass: 'w-[calc(100vw-2rem)] sm:!max-w-[720px]',
          context: { documentType },
        },
      );

    dialogRef.closed$.subscribe((result) => {
      if (result) this.upsertItem(result);
    });
  }

  selectDocumentTypeForDeletion(
    documentType: DocumentTypeWithSubTypesResponse,
  ): void {
    this.deleteError.set(null);
    this.documentTypePendingDelete.set(documentType);
  }

  confirmRemove(deleteDialog: HlmAlertDialog): void {
    const documentType = this.documentTypePendingDelete();
    if (!documentType || this.isDeleting()) return;

    this.isDeleting.set(true);
    this.deleteError.set(null);

    this.documentTypeDataSource
      .remove(documentType.id)
      .pipe(finalize(() => this.isDeleting.set(false)))
      .subscribe({
        next: () => {
          this.removeItem(documentType.id);
          deleteDialog.close();
        },
        error: () => {
          this.deleteError.set(
            'No se pudo eliminar el tipo de documento. Verifica que no esté en uso.',
          );
        },
      });
  }

  onDeleteDialogClosed(): void {
    this.documentTypePendingDelete.set(null);
    this.deleteError.set(null);
  }

  subtypeSummary(documentType: DocumentTypeWithSubTypesResponse): string {
    const { subtypes } = documentType;
    if (subtypes.length === 0) return 'Sin subtipos';

    const names = subtypes
      .slice(0, 2)
      .map(({ name }) => name)
      .join(', ');
    const remaining = subtypes.length - 2;

    return `${subtypes.length} ${
      subtypes.length === 1 ? 'subtipo' : 'subtipos'
    } · ${names}${remaining > 0 ? ` y ${remaining} más` : ''}`;
  }

  private upsertItem(newItem: DocumentTypeWithSubTypesResponse): void {
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
    this.dataSize.update((total) => total + 1);
  }

  private removeItem(id: number): void {
    this.dataSource.update((values) => values.filter((item) => item.id !== id));

    const total = Math.max(0, this.dataSize() - 1);
    this.dataSize.set(total);

    const lastPage = Math.max(1, Math.ceil(total / this.pageSize()));
    if (this.currentPage() > lastPage) {
      this.currentPage.set(lastPage);
      return;
    }

    if (this.dataSource().length === 0 && total > 0) {
      this.documentTypeResource.reload();
    }
  }
}
