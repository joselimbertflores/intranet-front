import { Component, inject } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ListboxModule } from 'primeng/listbox';
import { ButtonModule } from 'primeng/button';

import { UserResponse } from '../../interfaces';
import { UserApi } from '../../services';

@Component({
  selector: 'app-user-editor',
  imports: [CommonModule, ReactiveFormsModule, ListboxModule, ButtonModule],
  templateUrl: './user-editor.html',
})
export class UserEditor {
  private userApi = inject(UserApi);
  private dialogRef = inject(DynamicDialogRef);

  readonly data: UserResponse = inject(DynamicDialogConfig).data;

  userForm: FormGroup = inject(FormBuilder).nonNullable.group({
    roleIds: [[], [Validators.required, Validators.minLength(1)]],
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
