import {
  ChangeDetectionStrategy,
  linkedSignal,
  ElementRef,
  computed,
  viewChild,
  Component,
  inject,
  signal,
  input,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import {
  moveItemInArray,
  CdkDragDrop,
  CdkDropList,
} from '@angular/cdk/drag-drop';

// import { ConfirmDialogModule } from '@app/shared/ui-compat';
// import { ButtonGroupModule } from '@app/shared/ui-compat';
// import { TieredMenuModule } from '@app/shared/ui-compat';
// import { DialogService } from '@app/shared/ui-compat';
// import { ConfirmationService } from '@app/shared/ui-compat';
// import { DividerModule } from '@app/shared/ui-compat';
// import { ButtonModule } from '@app/shared/ui-compat';
// import { MenuModule } from '@app/shared/ui-compat';
// import { TagModule } from '@app/shared/ui-compat';

import { AuthDataSource } from '../../../../../core/auth/auth-data-source';
import { PermissionAction, Resource } from '../../../../../core/auth/auth.types';
import {
  TutorialBlockResponse,
  TutorialBlockType,
  TutorialResponse,
} from '../../interfaces';
import {
  TutorialBLockDialogData,
  TutorialBlockEditor,
  TutorialEditor,
} from '../../dialogs';
import { TutorialBlockPreviewEditor } from '../../components';
import { TutorialDataSource } from '../../services';

@Component({
  selector: 'app-tutorial-detail-admin',
  imports: [
    CommonModule,
   
    FormsModule,
    CdkDropList,
 
    TutorialBlockPreviewEditor,
  ],
  templateUrl: './tutorial-detail-admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TutorialDetailAdmin {
  private location: Location = inject(Location);
  // private dialogService = inject(DialogService);
  // private confirmationService = inject(ConfirmationService);
  private tutorialDataSource = inject(TutorialDataSource);
  private authDataSource = inject(AuthDataSource);

  id = input.required<string>();
  canCreate = computed(() =>
    this.authDataSource.can(Resource.TUTORIALS, PermissionAction.CREATE),
  );
  canUpdate = computed(() =>
    this.authDataSource.can(Resource.TUTORIALS, PermissionAction.UPDATE),
  );
  canDelete = computed(() =>
    this.authDataSource.can(Resource.TUTORIALS, PermissionAction.DELETE),
  );

  tutorial = rxResource({
    params: () => ({ id: this.id() }),
    stream: ({ params }) => this.tutorialDataSource.getOne(params.id),
  });

  blocks = linkedSignal(() => this.tutorial.value()?.blocks ?? []);
  isReordered = signal(false);
  endOfBlocks = viewChild.required<ElementRef<HTMLDivElement>>('endOfBlocks');

  readonly menuItems = [
    {
      label: 'Texto',
      icon: 'ui-icon ui-icon-align-left',
      command: () => this.openBlockDialog('TEXT'),
    },
    {
      label: 'Imagen',
      icon: 'ui-icon ui-icon-image',
      command: () => this.openBlockDialog('IMAGE'),
    },
    {
      label: 'Video externo',
      icon: 'ui-icon ui-icon-youtube',
      command: () => this.openBlockDialog('VIDEO_URL'),
    },
    {
      label: 'Video subido',
      icon: 'ui-icon ui-icon-video',
      command: () => this.openBlockDialog('VIDEO_FILE'),
    },
    {
      label: 'Archivo',
      icon: 'ui-icon ui-icon-paperclip',
      command: () => this.openBlockDialog('FILE'),
    },
  ];

  openTutorialEditDialog(): void {
    // const dialogRef = this.dialogService.open(TutorialEditor, {
    //   header: 'Editar tutorial',
    //   draggable: false,
    //   closable: true,
    //   width: '30vw',
    //   data: this.tutorial.value(),
    //   breakpoints: {
    //     '960px': '75vw',
    //     '640px': '90vw',
    //   },
    // });

    // dialogRef?.onClose.subscribe((result?: TutorialResponse) => {
    //   if (!result) return;
    //   this.tutorial.update((value) => {
    //     if (!value) return;
    //     return { ...value, ...result };
    //   });
    // });
  }

  openBlockDialog(type: TutorialBlockType, block?: TutorialBlockResponse) {
    const data: TutorialBLockDialogData = {
      tutorialId: this.id(),
      type,
      block,
    };
    // const dialogRef = this.dialogService.open(TutorialBlockEditor, {
    //   header: block ? 'Editar bloque' : 'Agregar bloque',
    //   contentStyle: { overflow: 'visible' },
    //   closable: true,
    //   width: '40vw',
    //   breakpoints: {
    //     '960px': '75vw',
    //     '640px': '90vw',
    //   },
    //   data,
    // });
    // dialogRef?.onClose.subscribe((result?: TutorialBlockResponse) => {
    //   if (!result) return;
    //   this.upsertBlock(result);
    // });
  }

  deleteBlock(id: string) {
    // this.confirmationService.confirm({
    //   message: `¿Esta seguro que desea eliminar el bloque?`,
    //   header: 'Eliminar bloque',
    //   rejectButtonProps: {
    //     label: 'Cancelar',
    //     severity: 'secondary',
    //     outlined: true,
    //   },
    //   acceptButtonProps: {
    //     label: 'Aceptar',
    //   },
    //   accept: () => {
    //     this.tutorialDataSource.removeBlock(id).subscribe(() => {
    //       this.blocks.update((blocks) =>
    //         blocks.filter((block) => block.id !== id),
    //       );
    //     });
    //   },
    // });
  }

  reoderBlocks() {
    if (!this.isReordered()) return;
    const orders = this.blocks().map(({ id }, index) => ({
      id,
      order: index + 1,
    }));
    this.tutorialDataSource
      .updateBlockOrder(this.id(), orders)
      .subscribe(() => {
        this.isReordered.set(false);
      });
  }

  onDrop(event: CdkDragDrop<TutorialBlockResponse[]>) {
    moveItemInArray(this.blocks(), event.previousIndex, event.currentIndex);
    this.isReordered.set(true);
  }

  goBack() {
    this.location.back();
  }

  private upsertBlock(block: TutorialBlockResponse) {
    const index = this.blocks().findIndex((b) => b.id === block.id);
    if (index === -1) {
      this.blocks.update((blocks) => [...blocks, block]);
      this.scrollToEnd();
    } else {
      this.blocks.update((blocks) => {
        blocks[index] = block;
        return [...blocks];
      });
    }
  }

  private scrollToEnd() {
    setTimeout(() => {
      this.endOfBlocks().nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }, 100);
  }
}
