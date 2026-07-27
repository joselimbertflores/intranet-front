import { Component, computed, debounced, inject, signal } from '@angular/core';
import { disabled, form, FormField, FormRoot } from '@angular/forms/signals';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import {
  lucideCircleAlert,
  lucideRefreshCw,
  lucideDownload,
  lucideSearch,
  lucideFilter,
  lucidePlus,
} from '@ng-icons/lucide';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmPopoverImports } from '@spartan-ng/helm/popover';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';

import { PaginationControls, YearSelector } from '@app/shared';

import {
  OrganizationalUnitPicker,
  type OrganizationalUnitOption,
} from '../../components/organizational-unit-picker/organizational-unit-picker';
import { DocumentCreate } from '../../dialogs';
import { DocumentResponse, SectionTreeNodeResponse } from '../../interfaces';
import { DocumentDataSource } from '../../services';

export type { OrganizationalUnitOption } from '../../components/organizational-unit-picker/organizational-unit-picker';

interface FilterData {
  organizationalUnitId: string | null;
  documentTypeId: number | null;
  documentSubtypeId: number | null;
  year: number | null;
  status: string | null;
}

const EMPTY_FILTERS: Readonly<FilterData> = {
  organizationalUnitId: null,
  documentTypeId: null,
  documentSubtypeId: null,
  year: null,
  status: null,
};

@Component({
  selector: 'app-document-admin',
  imports: [
    FormsModule,
    FormField,
    FormRoot,
    NgIcon,
    HlmBadgeImports,
    HlmButtonImports,
    HlmFieldImports,
    HlmInputGroupImports,
    HlmPopoverImports,
    HlmSelectImports,
    HlmSpinner,
    HlmTableImports,
    HlmTooltipImports,
    OrganizationalUnitPicker,
    PaginationControls,
    YearSelector,
  ],
  templateUrl: './document-admin.html',
  providers: provideIcons({
    lucideCircleAlert,
    lucideDownload,
    lucideFilter,
    lucidePlus,
    lucideRefreshCw,
    lucideSearch,
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

  readonly dataSource = computed(
    () => this.documentResource.value()?.documents ?? [],
  );
  readonly dataSize = computed(() => this.documentResource.value()?.total ?? 0);
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
  readonly organizationalUnitOptions = computed(() =>
    this.flattenOrganizationalUnits(this.organizationalUnits()),
  );

  readonly statusOptions = [
    { value: 'ACTIVE', label: 'Activo' },
    { value: 'INACTIVE', label: 'Inactivo' },
  ];

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
        contentClass: 'w-[calc(100vw-2rem)] sm:!max-w-[800px]',
      },
    );

    dialogRef.closed$.subscribe((documents) => {
      if (documents?.length) {
        this.documentResource.reload();
      }
    });
  }

  downloadFile({ file }: DocumentResponse): void {
    const fileUrl = new URL(file.url);
    fileUrl.searchParams.set('download', 'true');
    window.open(fileUrl.toString(), '_blank', 'noopener,noreferrer');
  }

  private flattenOrganizationalUnits(
    nodes: SectionTreeNodeResponse[],
    parentPath: string[] = [],
    depth = 0,
  ): OrganizationalUnitOption[] {
    return nodes.flatMap((node) => {
      const path = [...parentPath, node.name];
      return [
        {
          id: node.id,
          name: node.name,
          depth,
          searchText: path.join(' / '),
        },
        ...this.flattenOrganizationalUnits(node.children, path, depth + 1),
      ];
    });
  }
}
