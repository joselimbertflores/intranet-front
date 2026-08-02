import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import {
  disabled,
  form,
  FormField,
  FormRoot,
  validate,
} from '@angular/forms/signals';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import {
  HlmDialogFooter,
  HlmDialogHeader,
  HlmDialogTitle,
} from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmTextarea } from '@spartan-ng/helm/textarea';
import { firstValueFrom } from 'rxjs';

import { GroupedPermissionResponse, RoleResponse } from '../../interfaces';
import { CreateRoleDto, RoleApi, UpdateRoleDto } from '../../services/role-api';

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

export interface RoleEditorContext {
  role?: RoleResponse;
}

interface RoleFormModel {
  name: string;
  description: string;
  isAutoAssigned: boolean;
  permissionIds: number[];
}

@Component({
  selector: 'app-role-editor',
  imports: [
    FormField,
    FormRoot,
    HlmButtonImports,
    HlmCheckbox,
    HlmDialogFooter,
    HlmDialogHeader,
    HlmDialogTitle,
    HlmFieldImports,
    HlmInput,
    HlmSkeleton,
    HlmSpinner,
    HlmTextarea,
  ],
  templateUrl: './role-editor.html',
  host: {
    class: 'flex max-h-[calc(100dvh-4rem)] min-h-0 flex-col',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleEditor {
  private readonly dialogRef =
    inject<BrnDialogRef<RoleResponse>>(BrnDialogRef);
  private readonly roleApi = inject(RoleApi);
  private readonly context = injectBrnDialogContext<RoleEditorContext>();

  readonly role = this.context.role;
  readonly isProtectedRole = this.role?.name === 'ADMIN';
  readonly permissionsResource = rxResource({
    stream: () => this.roleApi.getPermissions(),
  });
  readonly permissionGroups = computed(() =>
    (this.permissionsResource.value() ?? []).map((group) => ({
      ...group,
      label: RESOURCE_LABELS[group.resource] ?? group.resource,
    })),
  );

  readonly formModel = signal<RoleFormModel>({
    name: this.role?.name ?? '',
    description: this.role?.description ?? '',
    isAutoAssigned: this.role?.isAutoAssigned ?? false,
    permissionIds: this.role?.permissions.map(({ id }) => id) ?? [],
  });

  readonly roleForm = form(
    this.formModel,
    (schemaPath) => {
      disabled(schemaPath, {
        when: ({ state }) => state.submitting(),
      });

      if (this.isProtectedRole) {
        disabled(schemaPath.name, {
          when: 'El nombre del rol ADMIN está reservado.',
        });
        disabled(schemaPath.isAutoAssigned, {
          when: 'El rol ADMIN no puede asignarse automáticamente.',
        });
        disabled(schemaPath.permissionIds, {
          when: 'Los permisos de ADMIN son administrados por el backend.',
        });
      }

      validate(schemaPath.name, ({ value }) =>
        value().trim()
          ? null
          : {
              kind: 'required',
              message: 'El nombre del rol es obligatorio.',
            },
      );
      validate(schemaPath.permissionIds, ({ value }) =>
        value().length > 0
          ? null
          : {
              kind: 'required',
              message: 'Seleccione al menos un permiso.',
            },
      );
    },
    {
      submission: {
        action: async (formField) => {
          const value = formField().value();
          const request = this.role
            ? this.roleApi.update(this.role.id, this.buildUpdateDto(value))
            : this.roleApi.create(this.buildCreateDto(value));
          const response = await firstValueFrom(request);
          this.dialogRef.close(response);
        },
      },
    },
  );

  close(): void {
    if (this.roleForm().submitting()) return;
    this.dialogRef.close();
  }

  actionLabel(action: string): string {
    return ACTION_LABELS[action] ?? action;
  }

  isPermissionSelected(id: number): boolean {
    return this.formModel().permissionIds.includes(id);
  }

  togglePermission(id: number, checked: boolean): void {
    if (this.isProtectedRole) return;
    this.formModel.update((value) => ({
      ...value,
      permissionIds: checked
        ? [...new Set([...value.permissionIds, id])]
        : value.permissionIds.filter((permissionId) => permissionId !== id),
    }));
    this.roleForm.permissionIds().markAsTouched();
  }

  isResourceFullySelected(group: GroupedPermissionResponse): boolean {
    return group.permissions.every(({ id }) =>
      this.formModel().permissionIds.includes(id),
    );
  }

  toggleResource(group: GroupedPermissionResponse): void {
    if (this.isProtectedRole) return;
    const groupIds = group.permissions.map(({ id }) => id);
    const removeAll = groupIds.every((id) =>
      this.formModel().permissionIds.includes(id),
    );

    this.formModel.update((value) => ({
      ...value,
      permissionIds: removeAll
        ? value.permissionIds.filter((id) => !groupIds.includes(id))
        : [...new Set([...value.permissionIds, ...groupIds])],
    }));
    this.roleForm.permissionIds().markAsTouched();
  }

  private buildCreateDto(value: RoleFormModel): CreateRoleDto {
    const description = value.description.trim();
    return {
      name: value.name.trim(),
      ...(description && { description }),
      isAutoAssigned: value.isAutoAssigned,
      permissionIds: value.permissionIds,
    };
  }

  private buildUpdateDto(value: RoleFormModel): UpdateRoleDto {
    if (this.isProtectedRole) {
      return { description: value.description.trim() };
    }
    return {
      name: value.name.trim(),
      description: value.description.trim(),
      isAutoAssigned: value.isAutoAssigned,
      permissionIds: value.permissionIds,
    };
  }
}
