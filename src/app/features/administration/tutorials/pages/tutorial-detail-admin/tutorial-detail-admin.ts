import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideFile,
  lucideFileVideo,
  lucideGripVertical,
  lucideImage,
  lucidePencil,
  lucidePlus,
  lucideText,
  lucideTrash2,
  lucideYoutube,
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
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { firstValueFrom } from 'rxjs';

import { AuthDataSource } from '../../../../../core/auth/auth-data-source';
import { PermissionAction, Resource } from '../../../../../core/auth/auth.types';
import {
  TutorialBlockInlineEditor,
  TutorialBlockPreviewEditor,
} from '../../components';
import { TutorialEditor, TutorialEditorContext } from '../../dialogs';
import { tutorialHttpErrorMessage } from '../../helpers';
import {
  TutorialBlockResponse,
  TutorialBlockType,
  TutorialDetailResponse,
} from '../../interfaces';
import { TutorialDataSource } from '../../services';

interface ActiveBlockEditor {
  type: TutorialBlockType;
  blockId: string | null;
}

@Component({
  selector: 'app-tutorial-detail-admin',
  imports: [
    CdkDrag,
    CdkDragHandle,
    CdkDropList,
    HlmAlertDialogImports,
    HlmAlertImports,
    HlmBadge,
    HlmButtonImports,
    HlmDropdownMenuImports,
    HlmSkeleton,
    HlmSpinner,
    NgIcon,
    TutorialBlockInlineEditor,
    TutorialBlockPreviewEditor,
  ],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideFile,
      lucideFileVideo,
      lucideGripVertical,
      lucideImage,
      lucidePencil,
      lucidePlus,
      lucideText,
      lucideTrash2,
      lucideYoutube,
    }),
  ],
  templateUrl: './tutorial-detail-admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TutorialDetailAdmin {
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly dataSource = inject(TutorialDataSource);
  private readonly authDataSource = inject(AuthDataSource);
  private readonly dialogService = inject(HlmDialogService);
  private readonly hasPreviousNavigation = Boolean(
    this.router.currentNavigation()?.previousNavigation ??
      this.router.lastSuccessfulNavigation()?.previousNavigation,
  );

  readonly id = input.required<string>();
  readonly blockTypes = [
    { type: TutorialBlockType.TEXT, label: 'Texto', icon: 'lucideText' },
    { type: TutorialBlockType.IMAGE, label: 'Imagen', icon: 'lucideImage' },
    { type: TutorialBlockType.YOUTUBE, label: 'YouTube', icon: 'lucideYoutube' },
    {
      type: TutorialBlockType.VIDEO_FILE,
      label: 'Video subido',
      icon: 'lucideFileVideo',
    },
    { type: TutorialBlockType.FILE, label: 'Archivo', icon: 'lucideFile' },
  ] as const;

  readonly tutorialResource = rxResource({
    params: () => ({ id: this.id() }),
    stream: ({ params }) => this.dataSource.getOne(params.id),
  });
  readonly tutorial = linkedSignal<TutorialDetailResponse | null>(
    () => this.tutorialResource.value() ?? null,
  );
  readonly blocks = linkedSignal<TutorialBlockResponse[]>(
    () => this.tutorialResource.value()?.blocks ?? [],
  );

  readonly publicationError = signal<string | null>(null);
  readonly publicationPending = signal(false);
  readonly reorderError = signal<string | null>(null);
  readonly reordering = signal(false);
  readonly activeEditor = signal<ActiveBlockEditor | null>(null);

  readonly pendingBlockDelete = signal<TutorialBlockResponse | null>(null);
  readonly blockDeleteError = signal<string | null>(null);
  readonly blockDeleting = signal(false);
  readonly tutorialDeleteError = signal<string | null>(null);
  readonly tutorialDeleting = signal(false);

  readonly canCreate = computed(() =>
    this.authDataSource.can(Resource.TUTORIALS, PermissionAction.CREATE),
  );
  readonly canUpdate = computed(() =>
    this.authDataSource.can(Resource.TUTORIALS, PermissionAction.UPDATE),
  );
  readonly canDelete = computed(() =>
    this.authDataSource.can(Resource.TUTORIALS, PermissionAction.DELETE),
  );

  goBack(): void {
    if (this.hasPreviousNavigation) {
      this.location.back();
      return;
    }
    void this.router.navigate(['/administration/tutorials']);
  }

  openTutorialDialog(): void {
    const tutorial = this.tutorial();
    if (!tutorial) return;

    const dialogRef = this.dialogService.open<
      TutorialDetailResponse,
      TutorialEditorContext
    >(TutorialEditor, {
      showCloseButton: false,
      autoFocus: 'input',
      contentClass: 'w-[calc(100vw-2rem)] sm:!max-w-lg',
      context: { tutorial },
    });

    dialogRef.closed$.subscribe((updated) => {
      if (!updated) return;
      this.tutorial.set({ ...updated, blocks: this.blocks() });
    });
  }

  startCreateBlock(type: TutorialBlockType): void {
    this.activeEditor.set({ type, blockId: null });
  }

  startEditBlock(block: TutorialBlockResponse): void {
    this.activeEditor.set({ type: block.type, blockId: block.id });
  }

  onBlockSaved(block: TutorialBlockResponse): void {
    const exists = this.blocks().some(({ id }) => id === block.id);
    this.blocks.update((blocks) =>
      exists
        ? blocks.map((current) => (current.id === block.id ? block : current))
        : [...blocks, block],
    );
    this.activeEditor.set(null);
    this.syncTutorialBlocks();
  }

  async onDrop(event: CdkDragDrop<TutorialBlockResponse[]>): Promise<void> {
    if (event.previousIndex === event.currentIndex || this.reordering()) return;

    const previous = [...this.blocks()];
    const reordered = [...previous];
    moveItemInArray(reordered, event.previousIndex, event.currentIndex);
    const withOrder = reordered.map((block, index) => ({
      ...block,
      order: index + 1,
    }));
    this.blocks.set(withOrder);
    this.reordering.set(true);
    this.reorderError.set(null);
    try {
      await firstValueFrom(
        this.dataSource.updateBlockOrder(this.id(), {
          blockIds: withOrder.map(({ id }) => id),
        }),
      );
      this.syncTutorialBlocks();
    } catch (error) {
      this.blocks.set(previous);
      this.reorderError.set(
        tutorialHttpErrorMessage(error, 'No se pudo guardar el nuevo orden'),
      );
    } finally {
      this.reordering.set(false);
    }
  }

  prepareBlockDelete(block: TutorialBlockResponse): void {
    this.blockDeleteError.set(null);
    this.pendingBlockDelete.set(block);
  }

  async confirmBlockDelete(dialog: HlmAlertDialog): Promise<void> {
    const block = this.pendingBlockDelete();
    if (!block || this.blockDeleting()) return;
    this.blockDeleting.set(true);
    this.blockDeleteError.set(null);
    try {
      await firstValueFrom(this.dataSource.removeBlock(block.id));
      this.blocks.update((blocks) =>
        blocks.filter(({ id }) => id !== block.id),
      );
      if (this.activeEditor()?.blockId === block.id) {
        this.activeEditor.set(null);
      }
      this.syncTutorialBlocks();
      dialog.close();
    } catch (error) {
      this.blockDeleteError.set(
        tutorialHttpErrorMessage(error, 'No se pudo eliminar el bloque'),
      );
    } finally {
      this.blockDeleting.set(false);
    }
  }

  resetBlockDelete(): void {
    this.pendingBlockDelete.set(null);
    this.blockDeleteError.set(null);
  }

  async togglePublication(): Promise<void> {
    const tutorial = this.tutorial();
    if (!tutorial || this.publicationPending()) return;
    if (!tutorial.isPublished && this.blocks().length === 0) return;

    this.publicationPending.set(true);
    this.publicationError.set(null);
    try {
      const updated = await firstValueFrom(
        this.dataSource.updatePublication(tutorial.id, {
          isPublished: !tutorial.isPublished,
        }),
      );
      this.tutorial.set({ ...updated, blocks: this.blocks() });
    } catch (error) {
      this.publicationError.set(
        tutorialHttpErrorMessage(error, 'No se pudo cambiar la publicación'),
      );
    } finally {
      this.publicationPending.set(false);
    }
  }

  async confirmTutorialDelete(dialog: HlmAlertDialog): Promise<void> {
    const tutorial = this.tutorial();
    if (!tutorial || this.tutorialDeleting()) return;
    this.tutorialDeleting.set(true);
    this.tutorialDeleteError.set(null);
    try {
      await firstValueFrom(this.dataSource.remove(tutorial.id));
      dialog.close();
      this.goBack();
    } catch (error) {
      this.tutorialDeleteError.set(
        tutorialHttpErrorMessage(error, 'No se pudo eliminar el tutorial'),
      );
    } finally {
      this.tutorialDeleting.set(false);
    }
  }

  private syncTutorialBlocks(): void {
    const tutorial = this.tutorial();
    if (tutorial) this.tutorial.set({ ...tutorial, blocks: this.blocks() });
  }
}
