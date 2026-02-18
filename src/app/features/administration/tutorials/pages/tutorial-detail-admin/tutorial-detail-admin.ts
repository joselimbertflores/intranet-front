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
  DragDropModule,
  CdkDragDrop,
} from '@angular/cdk/drag-drop';
import { MenuModule } from 'primeng/menu';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { TutorialBlockEditor } from '../../dialogs/tutorial-block-editor/tutorial-block-editor';

@Component({
  selector: 'app-tutorial-detail-admin',
  imports: [
    CommonModule,
    TagModule,
    DragDropModule,
    MenuModule,
    FormsModule,
    ButtonModule,
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

  goBack() {
    this.router.navigate(['/admin/tutorials']); // Ajusta tu ruta
  }

  openBlockDialog(type: string) {
    this.dialogService.open(TutorialBlockEditor, {
      header: 'Nuevo bloque',
      width: '50vw',
      contentStyle: { overflow: 'visible' }, 
      data: {
        blockType: type,
      },
    });
  }
}
