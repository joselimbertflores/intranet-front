import {
  ChangeDetectionStrategy,
  linkedSignal,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  moveItemInArray,
  CdkDragDrop,
  CdkDropList,
  CdkDragHandle,
  CdkDrag,
} from '@angular/cdk/drag-drop';

import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { ConfirmationService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { TagModule } from 'primeng/tag';

import { TutorialDataSource } from '../../services';

import { TutorialBlockResponse, TutorialBlockType } from '../../interfaces';
import { TutorialBLockDialogData, TutorialBlockEditor } from '../../dialogs';
import { TutorialBlockPreview } from '../../components';

@Component({
  selector: 'app-tutorial-detail-admin',
  imports: [
    CommonModule,
    CdkDrag,
    MenuModule,
    TagModule,
    FormsModule,
    CdkDropList,
    ButtonModule,
    CdkDragHandle,
    DividerModule,
    ConfirmDialogModule,
    TutorialBlockPreview
  ],
  templateUrl: './tutorial-detail-admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService],
})
export default class TutorialDetailAdmin {
  private router = inject(Router);
  private dialogService = inject(DialogService);
  private tutorialDataSource = inject(TutorialDataSource);
  private confirmationService = inject(ConfirmationService);

  id = input.required<string>();

  tutorial = rxResource({
    params: () => ({ id: this.id() }),
    stream: ({ params }) => this.tutorialDataSource.getOne(params.id),
  });

  blocks = linkedSignal(() => this.tutorial.value()?.blocks ?? []);

  isReordered = signal(false);

  readonly menuItems = [
    {
      label: 'Texto',
      icon: 'pi pi-align-left',
      command: () => this.openBlockDialog('TEXT'),
    },
    {
      label: 'Imagen',
      icon: 'pi pi-image',
      command: () => this.openBlockDialog('IMAGE'),
    },
    {
      label: 'Video externo',
      icon: 'pi pi-youtube',
      command: () => this.openBlockDialog('VIDEO_URL'),
    },
    {
      label: 'Video subido',
      icon: 'pi pi-video',
      command: () => this.openBlockDialog('VIDEO_FILE'),
    },
    {
      label: 'Archivo',
      icon: 'pi pi-paperclip',
      command: () => this.openBlockDialog('FILE'),
    },
  ];

  constructor() {}

  openBlockDialog(type: TutorialBlockType, block?: TutorialBlockResponse) {
    const data: TutorialBLockDialogData = {
      tutorialId: this.id(),
      type,
      block,
    };
    const dialogRef = this.dialogService.open(TutorialBlockEditor, {
      header: block ? 'Editar bloque' : 'Agregar bloque',
      width: '40vw',
      closable: true,
      contentStyle: { overflow: 'visible' },
      data,
    });
    dialogRef?.onClose.subscribe((result: TutorialBlockResponse) => {
      this.upsertBlock(result);
    });
  }

  deleteBlock(id: string) {
    this.confirmationService.confirm({
      message: `¿Esta seguro que desea eliminar el bloque?`,
      header: 'Eliminar bloque',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Aceptar',
      },
      accept: () => {
        this.tutorialDataSource.removeBlock(id).subscribe(() => {
          this.blocks.update((blocks) =>
            blocks.filter((block) => block.id !== id),
          );
        });
      },
    });
  }

  reoderBlocks() {
    if (!this.isReordered()) return;
    const orders = this.blocks().map((b, index) => ({
      id: b.id,
      order: index + 1,
    }));
    this.tutorialDataSource
      .updateBlockOrder(this.tutorial.value()!.id, orders)
      .subscribe(() => {
        this.isReordered.set(false);
      });
  }

  onDrop(event: CdkDragDrop<TutorialBlockResponse[]>) {
    moveItemInArray(this.blocks(), event.previousIndex, event.currentIndex);
    this.isReordered.set(true);
  }

  goBack() {
    this.router.navigate(['/admin/tutorials']); // Ajusta tu ruta
  }

  private upsertBlock(block: TutorialBlockResponse) {
    const index = this.blocks().findIndex((b) => b.id === block.id);
    if (index === -1) {
      this.blocks.update((blocks) => [...blocks, block]);
    } else {
      this.blocks.update((blocks) => {
        blocks[index] = block;
        return [...blocks];
      });
    }
  }
}
