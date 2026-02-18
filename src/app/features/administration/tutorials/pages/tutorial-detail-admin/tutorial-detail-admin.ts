import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TutorialDataSource } from '../../services';
import { TagModule } from 'primeng/tag';
import {
  moveItemInArray,
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  CdkDragPlaceholder,
  CdkDragHandle,
} from '@angular/cdk/drag-drop';
import { MenuModule } from 'primeng/menu';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { TutorialBlockEditor } from '../../dialogs/tutorial-block-editor/tutorial-block-editor';
import { TutorialBlockResponse } from '../../interfaces';

@Component({
  selector: 'app-tutorial-detail-admin',
  imports: [
    CommonModule,
    TagModule,
    CdkDropList,
    CdkDrag,
    MenuModule,
    FormsModule,
    ButtonModule,
    CdkDragPlaceholder,
    CdkDragHandle,
  ],
  templateUrl: './tutorial-detail-admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TutorialDetailAdmin {
  private router = inject(Router);
  private dialogService = inject(DialogService);
  private tutorialDataSource = inject(TutorialDataSource);
  id = input.required<string>();

  tutorial = rxResource({
    params: () => ({ id: this.id() }),
    stream: ({ params }) => this.tutorialDataSource.getOne(params.id),
  });

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

  openBlockDialog(type: string, block?: any) {
    this.dialogService.open(TutorialBlockEditor, {
      header: 'Nuevo bloque',
      width: '40vw',
      closable: true,
      contentStyle: { overflow: 'visible' },
      data: {
        tutorialId: this.id(),
        blockType: type,
      },
    });
  }

  editBlock(block: TutorialBlockResponse) {
    this.dialogService.open(TutorialBlockEditor, {
      header: 'Editar bloque',
      width: '40vw',
      closable: true,
      contentStyle: { overflow: 'visible' },
      data: {
        tutorialId: this.id(),
        blockType: block.type,
        block,
      },
    });
  }

  deleteBlock(block: any) {}

  onDrop(event: CdkDragDrop<any[]>) {
    moveItemInArray(
      this.tutorial.value()?.blocks ?? [],
      event.previousIndex,
      event.currentIndex,
    );

    const orders = this.tutorial
      .value()!
      .blocks.map((b, index) => ({ id: b.id as string, order: index + 1 }));

    this.tutorialDataSource
      .updateBlockOrder(this.tutorial.value()!.id, orders)
      .subscribe();
  }
  goBack() {
    this.router.navigate(['/admin/tutorials']); // Ajusta tu ruta
  }
}
