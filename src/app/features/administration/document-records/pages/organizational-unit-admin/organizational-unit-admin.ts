import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideEllipsisVertical,
  lucidePencil,
  lucidePlus,
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
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { finalize } from 'rxjs';

import { OrganizationalUnitEditor } from '../../dialogs';
import { OrganizationalUnitResponse } from '../../interfaces';
import { OrganizationalUnitDatasource } from '../../services';

interface OrganizationalUnitTableRow extends OrganizationalUnitResponse {
  depth: number;
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
  ],
  providers: [
    provideIcons({
      lucideEllipsisVertical,
      lucidePencil,
      lucidePlus,
      lucideTrash2,
    }),
  ],
  templateUrl: './organizational-unit-admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OrganizationalUnitAdmin {
  private readonly organizationalUnitDataSource = inject(
    OrganizationalUnitDatasource,
  );
  private readonly dialogService = inject(HlmDialogService);

  readonly organizationalUnitPendingDelete =
    signal<OrganizationalUnitTableRow | null>(null);
  readonly isDeleting = signal(false);
  readonly deleteError = signal<string | null>(null);

  readonly organizationalUnitsResource = rxResource({
    stream: () => this.organizationalUnitDataSource.findTree(),
  });

  readonly organizationalUnits = computed(() =>
    this.flattenTree(this.organizationalUnitsResource.value() ?? []),
  );

  openOrganizationalUnitDialog(
    organizationalUnit?: OrganizationalUnitTableRow,
    parent?: OrganizationalUnitResponse,
  ): void {
    const dialogRef = this.dialogService.open<OrganizationalUnitResponse>(
      OrganizationalUnitEditor,
      {
        showCloseButton: false,
        disableClose: true,
        contentClass: 'w-[calc(100vw-2rem)] sm:!max-w-[480px]',
        context: {
          organizationalUnit,
          parent: parent ?? organizationalUnit?.parent ?? undefined,
        },
      },
    );

    dialogRef.closed$.subscribe((result) => {
      if (result) this.organizationalUnitsResource.reload();
    });
  }

  selectOrganizationalUnitForDeletion(
    organizationalUnit: OrganizationalUnitTableRow,
  ): void {
    this.deleteError.set(null);
    this.organizationalUnitPendingDelete.set(organizationalUnit);
  }

  confirmRemove(deleteDialog: HlmAlertDialog): void {
    const organizationalUnit = this.organizationalUnitPendingDelete();
    if (!organizationalUnit || this.isDeleting()) return;

    this.isDeleting.set(true);
    this.deleteError.set(null);

    this.organizationalUnitDataSource
      .remove(organizationalUnit.id)
      .pipe(finalize(() => this.isDeleting.set(false)))
      .subscribe({
        next: () => {
          this.organizationalUnitsResource.reload();
          deleteDialog.close();
        },
        error: (error: unknown) => {
          this.deleteError.set(this.getDeleteErrorMessage(error));
        },
      });
  }

  onDeleteDialogClosed(): void {
    this.organizationalUnitPendingDelete.set(null);
    this.deleteError.set(null);
  }

  private flattenTree(
    nodes: readonly OrganizationalUnitResponse[],
    depth = 0,
    parent: OrganizationalUnitResponse | null = null,
  ): OrganizationalUnitTableRow[] {
    return nodes.flatMap((node) => [
      { ...node, depth, parent },
      ...this.flattenTree(node.children, depth + 1, node),
    ]);
  }

  private getDeleteErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'No se pudo eliminar la unidad. Intenta nuevamente.';
    }

    const responseBody = error.error as
      | { message?: string | string[] }
      | string
      | null
      | undefined;
    const message =
      typeof responseBody === 'string' ? responseBody : responseBody?.message;

    if (Array.isArray(message)) return message.join(' ');
    if (typeof message === 'string' && message.trim()) return message;

    return error.status === 409
      ? 'La unidad no puede eliminarse porque tiene documentos o unidades hijas.'
      : 'No se pudo eliminar la unidad. Intenta nuevamente.';
  }
}
