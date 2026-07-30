import { Component, computed, debounced, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

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
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmBadge } from '@spartan-ng/helm/badge';

import { OrganizationalUnitEditor } from '../../dialogs';
import { OrganizationalUnitResponse } from '../../interfaces';
import { OrganizationalUnitDatasource } from '../../services';

interface OrganizationalUnitTableRow extends OrganizationalUnitResponse {
  depth: number;
  searchTerm: string;
  parent: OrganizationalUnitResponse | null;
}

@Component({
  selector: 'app-organizational-unit-admin',
  imports: [
    HlmAlertDialogImports,
    HlmBadge,
    HlmButtonImports,
    HlmDropdownMenuImports,
    HlmSpinner,
    HlmTableImports,
    NgIcon,
    FormsModule,
    HlmInputGroupImports,
  ],
  providers: [
    provideIcons({
      lucideEllipsisVertical,
      lucidePencil,
      lucidePlus,
      lucideTrash2,
      lucideSearch,
    }),
  ],
  templateUrl: './organizational-unit-admin.html',
})
export default class OrganizationalUnitAdmin {
  private readonly organizationalUnitDataSource = inject(
    OrganizationalUnitDatasource,
  );
  private readonly dialogService = inject(HlmDialogService);

  readonly orgUnitPendingDelete = signal<OrganizationalUnitTableRow | null>(
    null,
  );

  readonly organizationalUnitsResource = rxResource({
    stream: () => this.organizationalUnitDataSource.findTree(),
  });

  readonly tableRows = computed(() =>
    this.flattenTree(this.organizationalUnitsResource.value() ?? []),
  );

  searchTerm = signal('');
  readonly debouncedSearchTerm = debounced(this.searchTerm, 300);

  readonly filteredRows = computed(() => {
    const term = this.normalizeSearch(this.debouncedSearchTerm.value());
    if (!term) {
      return this.tableRows();
    }
    return this.tableRows().filter((row) => row.searchTerm.includes(term));
  });

  openOrganizationalUnitDialog(
    unit?: OrganizationalUnitTableRow,
    parent?: OrganizationalUnitResponse,
  ) {
    const dialogRef = this.dialogService.open<OrganizationalUnitResponse>(
      OrganizationalUnitEditor,
      {
        showCloseButton: false,
        disableClose: true,
        contentClass: 'w-[calc(100vw-2rem)] sm:!max-w-[480px]',
        context: {
          organizationalUnit: unit,
          parent: parent ?? unit?.parent ?? undefined,
        },
      },
    );

    dialogRef.closed$.subscribe((result) => {
      if (result) this.organizationalUnitsResource.reload();
    });
  }

  confirmRemove(deleteDialog: HlmAlertDialog): void {
    const organizationalUnit = this.orgUnitPendingDelete();
    if (!organizationalUnit) return;
    this.organizationalUnitDataSource
      .remove(organizationalUnit.id)
      .subscribe(() => {
        this.organizationalUnitsResource.reload();
        deleteDialog.close();
      });
  }

  private flattenTree(
    nodes: readonly OrganizationalUnitResponse[],
    depth = 0,
    parent: OrganizationalUnitResponse | null = null,
    parentPath: readonly string[] = [],
  ): OrganizationalUnitTableRow[] {
    return nodes.flatMap((node) => {
      const path = [...parentPath, node.name];

      return [
        {
          ...node,
          depth,
          parent,
          path,
          searchTerm: this.normalizeSearch(path.join(' / ')),
        },
        ...this.flattenTree(node.children, depth + 1, node, path),
      ];
    });
  }

  private normalizeSearch(value: string): string {
    return value
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .trim();
  }
}
