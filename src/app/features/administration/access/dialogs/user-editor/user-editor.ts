import { TitleCasePipe } from '@angular/common';
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';

import { FormUtils } from '../../../../../helpers';
import { UserResponse } from '../../interfaces';
import { UserApi } from '../../services';

@Component({
  selector: 'app-user-editor',
  imports: [
    ReactiveFormsModule,
    MultiSelectModule,
    FloatLabelModule,
    ButtonModule,
    MessageModule,
    TitleCasePipe,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './user-editor.html',
})
export class UserEditor {
  private userApi = inject(UserApi);
  private dialogRef = inject(DynamicDialogRef);

  readonly data: UserResponse = inject(DynamicDialogConfig).data;
  formUtils = FormUtils;
  userForm: FormGroup = inject(FormBuilder).nonNullable.group({
    roleIds: ['', Validators.required],
  });

  roles = toSignal(this.userApi.getRoles(), { initialValue: [] });

  ngOnInit() {
    this.loadForm();
  }

  save() {
    const { roleIds } = this.userForm.value;
    this.userApi.update(this.data.id, roleIds).subscribe((resp) => {
      this.dialogRef.close(resp);
    });
  }

  close() {
    this.dialogRef.close();
  }

  private loadForm() {
    this.userForm.patchValue({ roleIds: this.data.roles.map(({ id }) => id) });
  }
}
