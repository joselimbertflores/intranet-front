import { Component, computed, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ListboxModule } from 'primeng/listbox';
import { ButtonModule } from 'primeng/button';

import { RoleApi } from '../../services';
import { RoleResponse } from '../../interfaces';

const RESOURCE_LABELS: Record<string, string> = {
  users: 'Usuarios',
  roles: 'Roles',
  documents: 'Documentos',
  communications: 'Comunicados',
  calendar: 'Calendario',
  directory: 'Directorio',
  tutorials: 'Tutoriales',
  content: 'Contenido',
};

const ACTION_LABELS: Record<string, string> = {
  read: 'Ver',
  create: 'Crear',
  update: 'Editar',
  delete: 'Eliminar',
};

interface PermissionGroupView {
  resource: string;
  label: string;
  permissions: PermissionView[];
}

interface PermissionView {
  id: number;
  action: string;
  label: string;
}
@Component({
  selector: 'app-role-editor',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    FloatLabelModule,
    InputTextModule,
    CheckboxModule,
    ListboxModule,
    ButtonModule,
  ],
  template: `
    <form [formGroup]="roleForm" (ngSubmit)="save()">
      <div class="space-y-4 pt-2">
        <p-floatlabel variant="on">
          <input
            id="name"
            [fluid]="true"
            pInputText
            autocomplete="off"
            formControlName="name"
          />
          <label for="name">Nombre</label>
        </p-floatlabel>
        <p-floatlabel variant="on">
          <input
            id="description"
            [fluid]="true"
            pInputText
            autocomplete="off"
            formControlName="description"
          />
          <label for="description">Descripcion</label>
        </p-floatlabel>
        <label class="flex items-center gap-2 px-2 py-2">
          <p-checkbox formControlName="isAutoAssigned" [binary]="true" />
          <span>Autoasignar</span>
        </label>

        <div class="mt-6 space-y-2">
          @for (group of permissions(); track group.resource) {
            <section class="rounded-xl border border-surface-200 p-4">
              <div class="mb-3 flex items-center justify-between gap-3">
                <h3 class="font-semibold">
                  {{ group.label }}
                </h3>

                <button
                  type="button"
                  class="text-sm text-primary"
                  (click)="toggleResource(group)"
                >
                  {{
                    isResourceFullySelected(group)
                      ? 'Quitar todos'
                      : 'Marcar todos'
                  }}
                </button>
              </div>

              <div class="flex flex-wrap gap-2">
                @for (permission of group.permissions; track permission.id) {
                  <label
                    class="flex items-center gap-2 rounded-lg border border-surface-200 px-3 py-2 text-sm"
                  >
                    <p-checkbox
                      [binary]="true"
                      [ngModel]="isPermissionSelected(permission.id)"
                      (ngModelChange)="togglePermission(permission.id, $event)"
                      [ngModelOptions]="{ standalone: true }"
                    />

                    <span>{{ permission.label }}</span>
                  </label>
                }
              </div>
            </section>
          }
        </div>
      </div>
      <div class="p-dialog-footer">
        <p-button
          label="Cancelar"
          type="button"
          severity="secondary"
          (onClick)="close()"
        />
        <p-button label="Guardar" type="submit" />
      </div>
    </form>
  `,
})
export class RoleEditor {
  private roleDataSource = inject(RoleApi);
  private dialogRef = inject(DynamicDialogRef);
  private formBuilder = inject(FormBuilder);

  readonly data?: RoleResponse = inject(DynamicDialogConfig).data;

  permissions = computed<PermissionGroupView[]>(() =>
    this.roleDataSource.permissions().map(({ resource, permissions }) => ({
      resource: resource,
      label: RESOURCE_LABELS[resource] ?? resource,
      permissions: permissions.map((permission) => ({
        id: permission.id,
        action: permission.action,
        label: ACTION_LABELS[permission.action] ?? permission.action,
      })),
    })),
  );

  roleForm = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    permissionIds: this.formBuilder.nonNullable.control<number[]>(
      [],
      [Validators.required, Validators.minLength(1)],
    ),
    isAutoAssigned: [false],
  });

  ngOnInit() {
    this.loadForm();
  }

  save() {
    if (this.roleForm.invalid) return this.roleForm.markAllAsTouched();
    const saveObservable = this.data
      ? this.roleDataSource.update(this.data.id, this.roleForm.value)
      : this.roleDataSource.create(this.roleForm.value);

    saveObservable.subscribe((resp) => {
      this.dialogRef.close(resp);
    });
  }

  close() {
    this.dialogRef.close();
  }

  isResourceFullySelected(group: PermissionGroupView): boolean {
    const selected = this.roleForm.controls.permissionIds.value;
    return group.permissions.every((permission) =>
      selected.includes(permission.id),
    );
  }

  toggleResource(group: PermissionGroupView): void {
    const control = this.roleForm.controls.permissionIds;
    const current = control.value;
    const groupIds = group.permissions.map((permission) => permission.id);

    const shouldRemove = groupIds.every((id) => current.includes(id));

    const next = shouldRemove
      ? current.filter((id) => !groupIds.includes(id))
      : [...new Set([...current, ...groupIds])];

    control.setValue(next);
    control.markAsDirty();
    control.markAsTouched();
  }

  isPermissionSelected(id: number): boolean {
    return this.roleForm.controls.permissionIds.value.includes(id);
  }

  togglePermission(id: number, checked: boolean): void {
    const control = this.roleForm.controls.permissionIds;
    const current = control.value;

    const next = checked
      ? [...new Set([...current, id])]
      : current.filter((item) => item !== id);

    control.setValue(next);
    control.markAsDirty();
    control.markAsTouched();
  }

  private loadForm() {
    if (!this.data) return;

    const { permissions, ...props } = this.data;

    this.roleForm.patchValue({
      name: props.name,
      description: props.description ?? '',
      permissionIds: permissions.map(({ id }) => id),
      isAutoAssigned: props.isAutoAssigned,
    });
  }
}
