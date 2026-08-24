import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCircleAlert,
  lucideGripVertical,
  lucideMoreHorizontal,
  lucidePencil,
  lucidePlus,
  lucideRefreshCw,
  lucideTrash2,
} from '@ng-icons/lucide';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import {
  HlmAlertDialog,
  HlmAlertDialogImports,
} from '@spartan-ng/helm/alert-dialog';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { finalize } from 'rxjs';

import { AuthDataSource } from '../../../../../core/auth/auth-data-source';
import {
  PermissionAction,
  Resource,
} from '../../../../../core/auth/auth.types';
import {
  QUICK_ACCESS_ICONS,
  resolveQuickAccessIcon,
} from '../../../../../shared/constants/quick-access-icons';
import { QuickAccessEditor } from '../../dialogs';
import { QuickAccessResponse } from '../../interfaces';
import { ContentSettingsDataSource } from '../../services';

@Component({
  selector: 'app-quick-accesses-admin',
  imports: [
    CdkDrag,
    CdkDragHandle,
    CdkDropList,
    HlmAlertDialogImports,
    HlmAlertImports,
    HlmBadge,
    HlmButtonImports,
    HlmDropdownMenuImports,
    HlmSkeletonImports,
    HlmSpinner,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideCircleAlert,
      lucideGripVertical,
      lucideMoreHorizontal,
      lucidePencil,
      lucidePlus,
      lucideRefreshCw,
      lucideTrash2,
      ...QUICK_ACCESS_ICONS,
    }),
  ],
  templateUrl: './quick-accesses-admin.html',
  styles: `
    .quick-access-row.cdk-drag-preview {
      box-sizing: border-box;
      opacity: 1;
      box-shadow: 0 18px 36px rgb(0 0 0 / 0.18);
    }

    .quick-access-row.cdk-drag-placeholder {
      opacity: 0.3;
    }

    .quick-access-row.cdk-drag-animating,
    .quick-access-list.cdk-drop-list-dragging
      .quick-access-row:not(.cdk-drag-placeholder) {
      transition: transform 180ms cubic-bezier(0, 0, 0.2, 1);
    }

    @media (prefers-reduced-motion: reduce) {
      .quick-access-row.cdk-drag-animating,
      .quick-access-list.cdk-drop-list-dragging
        .quick-access-row:not(.cdk-drag-placeholder) {
        transition: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class QuickAccessesAdmin {
  private readonly authDataSource = inject(AuthDataSource);
  private readonly contentDataSource = inject(ContentSettingsDataSource);
  private readonly dialogService = inject(HlmDialogService);
  private readonly destroyRef = inject(DestroyRef);

  readonly items = signal<QuickAccessResponse[]>([]);
  readonly persistedOrderIds = signal<number[]>([]);
  readonly isLoading = signal(true);
  readonly loadError = signal(false);
  readonly isSavingOrder = signal(false);
  readonly deletingId = signal<number | null>(null);
  readonly quickAccessToDelete = signal<QuickAccessResponse | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly skeletonItems = Array.from({ length: 5 });
  readonly resolveIcon = resolveQuickAccessIcon;

  readonly canCreate = computed(() =>
    this.authDataSource.can(Resource.CONTENT, PermissionAction.CREATE),
  );
  readonly canUpdate = computed(() =>
    this.authDataSource.can(Resource.CONTENT, PermissionAction.UPDATE),
  );
  readonly canDelete = computed(() =>
    this.authDataSource.can(Resource.CONTENT, PermissionAction.DELETE),
  );
  readonly isBusy = computed(
    () => this.isSavingOrder() || this.deletingId() !== null,
  );
  readonly hasOrderChanges = computed(() => {
    const currentIds = this.items().map(({ id }) => id);
    const persistedIds = this.persistedOrderIds();
    return (
      currentIds.length !== persistedIds.length ||
      currentIds.some((id, index) => id !== persistedIds[index])
    );
  });

  constructor() {
    this.loadQuickAccesses();
  }

  loadQuickAccesses(): void {
    this.isLoading.set(true);
    this.loadError.set(false);
    this.actionError.set(null);
    this.contentDataSource
      .getQuickAccesses()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (items) => {
          this.items.set(items);
          this.persistedOrderIds.set(items.map(({ id }) => id));
        },
        error: () => this.loadError.set(true),
      });
  }

  openEditor(quickAccess?: QuickAccessResponse): void {
    this.actionError.set(null);
    const dialogRef = this.dialogService.open<QuickAccessResponse>(
      QuickAccessEditor,
      {
        showCloseButton: false,
        disableClose: true,
        contentClass: 'w-[calc(100vw-2rem)] sm:!max-w-[620px]',
        context: { quickAccess },
      },
    );

    dialogRef.closed$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) this.upsertItem(result);
      });
  }

  drop(event: CdkDragDrop<QuickAccessResponse[]>): void {
    if (
      event.previousIndex === event.currentIndex ||
      !this.canUpdate() ||
      this.isBusy()
    )
      return;
    this.moveItem(event.previousIndex, event.currentIndex);
  }

  discardOrder(): void {
    const itemsById = new Map(this.items().map((item) => [item.id, item]));
    this.items.set(
      this.persistedOrderIds().flatMap((id) => {
        const item = itemsById.get(id);
        return item ? [item] : [];
      }),
    );
    this.actionError.set(null);
  }

  saveOrder(): void {
    if (!this.hasOrderChanges() || this.isSavingOrder()) return;

    this.isSavingOrder.set(true);
    this.actionError.set(null);
    this.contentDataSource
      .reorderQuickAccesses(this.items().map(({ id }) => id))
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSavingOrder.set(false)),
      )
      .subscribe({
        next: (items) => {
          this.items.set(items);
          this.persistedOrderIds.set(items.map(({ id }) => id));
        },
        error: () => {
          this.actionError.set(
            'No se pudo guardar el orden. El orden local se conservó para que puedas reintentar.',
          );
        },
      });
  }

  confirmRemove(deleteDialog: HlmAlertDialog): void {
    const quickAccess = this.quickAccessToDelete();
    if (!quickAccess || this.deletingId() !== null) return;

    this.deletingId.set(quickAccess.id);
    this.actionError.set(null);
    this.contentDataSource
      .removeQuickAccess(quickAccess.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.deletingId.set(null)),
      )
      .subscribe({
        next: () => {
          this.items.update((items) =>
            items.filter(({ id }) => id !== quickAccess.id),
          );
          this.persistedOrderIds.update((ids) =>
            ids.filter((id) => id !== quickAccess.id),
          );
          this.quickAccessToDelete.set(null);
          deleteDialog.close();
        },
        error: () => {
          this.actionError.set(
            'No se pudo eliminar el acceso. Intenta nuevamente.',
          );
        },
      });
  }

  private moveItem(previousIndex: number, currentIndex: number): void {
    if (!this.canUpdate() || this.isBusy()) return;
    this.items.update((items) => {
      const reorderedItems = [...items];
      moveItemInArray(reorderedItems, previousIndex, currentIndex);
      return reorderedItems;
    });
    this.actionError.set(null);
  }

  private upsertItem(newItem: QuickAccessResponse): void {
    const exists = this.items().some(({ id }) => id === newItem.id);
    if (exists) {
      this.items.update((items) =>
        items.map((item) => (item.id === newItem.id ? newItem : item)),
      );
      return;
    }

    this.items.update((items) => [...items, newItem]);
    this.persistedOrderIds.update((ids) => [...ids, newItem.id]);
  }
}
