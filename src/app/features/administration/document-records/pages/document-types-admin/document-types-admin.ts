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
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmBadge } from '@spartan-ng/helm/badge';

import { DocumentTypeWithSubTypesResponse } from '../../interfaces';
import { PaginationControls } from '../../../../../shared';
import { DocumentTypeDatasource } from '../../services';
import { DocumentTypeEditor } from '../../dialogs';

@Component({
  selector: 'app-document-types-admin',
  imports: [
    FormsModule,
    HlmDropdownMenuImports,
    HlmAlertDialogImports,
    HlmInputGroupImports,
    PaginationControls,
    HlmButtonImports,
    HlmTableImports,
    HlmSpinner,
    HlmBadge,
    NgIcon,
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

  readonly typePendingDelete = signal<DocumentTypeWithSubTypesResponse | null>(
    null,
  );

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
    const dialogRef = this.dialogService.open<DocumentTypeWithSubTypesResponse>(
      DocumentTypeEditor,
      {
        showCloseButton: false,
        autoFocus: false,
        contentClass: 'w-[calc(100vw-2rem)] sm:!max-w-[720px]',
        context: { documentType },
      },
    );

    dialogRef.closed$.subscribe((result) => {
      if (result) this.upsertItem(result);
    });
  }

  confirmRemove(deleteDialog: HlmAlertDialog): void {
    const documentType = this.typePendingDelete();
    if (!documentType) return;
    this.documentTypeDataSource.remove(documentType.id).subscribe(() => {
      this.removeItem(documentType.id);
      deleteDialog.close();
    });
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
