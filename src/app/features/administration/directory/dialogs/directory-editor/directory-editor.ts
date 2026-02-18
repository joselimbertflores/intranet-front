import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';

import { DirectoryDataSource } from '../../pages/services';
import { TreeDirectoryResponse } from '../../interfaces';
import { FormUtils } from '../../../../../helpers';

interface DialogData {
  directory?: TreeDirectoryResponse;
  parent?: ParentDirectory;
}

interface ParentDirectory {
  id: number;
  name: string;
}

@Component({
  selector: 'app-directory-editor',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FloatLabelModule,
    InputTextModule,
    MessageModule,
    ButtonModule,
  ],
  templateUrl: './directory-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DirectoryEditor implements OnInit {
  private diagloRef = inject(DynamicDialogRef);
  private formBuilder = inject(FormBuilder);
  private directoryDataSource = inject(DirectoryDataSource);

  readonly data: DialogData = inject(DynamicDialogConfig).data;
  readonly formUtils = FormUtils;

  directoryForm: FormGroup = this.formBuilder.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    internalPhone: [null, [Validators.minLength(4), Validators.maxLength(12)]],
    landlinePhone: [null, [Validators.minLength(4), Validators.maxLength(12)]],
  });

  ngOnInit() {
    this.loadForm();
  }

  close() {
    this.diagloRef.close();
  }

  save() {
    if (this.directoryForm.invalid) {
      return this.directoryForm.markAllAsTouched();
    }

    const dto = {
      ...this.directoryForm.value,
      parentId: this.data.parent?.id,
    };
    const subscription = this.data.directory?.id
      ? this.directoryDataSource.update(this.data.directory.id, dto)
      : this.directoryDataSource.create(dto);
    subscription.subscribe((resp) => {
      this.diagloRef.close(resp);
    });
  }

  private loadForm(): void {
    this.directoryForm.patchValue({ ...this.data.directory });
  }
}
