import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { EditorModule } from 'primeng/editor';

interface DialogData {
  blockType: string;
  block?: any;
}
@Component({
  selector: 'app-tutorial-block-editor',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FileUploadModule,
    FloatLabelModule,
    InputTextModule,
    TextareaModule,
    ButtonModule,
    EditorModule,
  ],
  templateUrl: './tutorial-block-editor.html',
  styles: `
    /* Arreglo para listas de Quill con Tailwind */
    .ql-editor ul {
      list-style-type: disc !important;
      padding-left: 1.5em !important;
    }

    .ql-editor ol {
      list-style-type: decimal !important;
      padding-left: 1.5em !important;
    }

    /* Opcional: Para que los links se vean azules y subrayados al editar */
    .ql-editor a {
      color: #3b82f6; /* blue-500 */
      text-decoration: underline;
    }

    /* Aumentar el z-index del tooltip de Quill para que flote sobre el Dialog */
    .ql-tooltip {
      z-index: 99999 !important;
    }

    /* Opcional: Si el tooltip se ve muy pegado o cortado lateralmente */
    .ql-tooltip.ql-editing {
      left: 50% !important;
      transform: translateX(-50%);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TutorialBlockEditor {
  private dialogRef = inject(DynamicDialogRef);
  private formBuilder = inject(FormBuilder);
  readonly data: DialogData = inject(DynamicDialogConfig).data;

  editorModules = {
    toolbar: [
      // Solo negrita, cursiva, subrayado
      ['bold', 'italic', 'underline'],

      // Solo listas ordenadas y desordenadas
      [{ list: 'ordered' }, { list: 'bullet' }],

      // Solo enlaces y limpiar formato
      ['link', 'clean'],
    ],
  };

  blockForm = this.formBuilder.group({
    content: [null],
  });

  save() {}

  close() {
    this.dialogRef.close();
  }
}
