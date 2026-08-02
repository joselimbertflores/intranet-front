import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  disabled,
  form,
  FormRoot,
  validate,
} from '@angular/forms/signals';
import { rxResource } from '@angular/core/rxjs-interop';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import {
  HlmDialogFooter,
  HlmDialogHeader,
  HlmDialogTitle,
} from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { firstValueFrom } from 'rxjs';

import { UserResponse } from '../../interfaces';
import { UserApi } from '../../services';

export interface UserEditorContext {
  user: UserResponse;
}

interface UserEditorFormModel {
  roleIds: string[];
}

@Component({
  selector: 'app-user-editor',
  imports: [
    FormRoot,
    HlmButtonImports,
    HlmCheckbox,
    HlmDialogFooter,
    HlmDialogHeader,
    HlmDialogTitle,
    HlmFieldImports,
    HlmSkeleton,
    HlmSpinner,
  ],
  templateUrl: './user-editor.html',
  host: {
    class: 'flex max-h-[calc(100dvh-4rem)] min-h-0 flex-col',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserEditor {
  private readonly dialogRef =
    inject<BrnDialogRef<UserResponse>>(BrnDialogRef);
  private readonly userApi = inject(UserApi);
  private readonly context = injectBrnDialogContext<UserEditorContext>();

  readonly user = this.context.user;
  readonly rolesResource = rxResource({
    stream: () => this.userApi.getRoles(),
  });

  readonly formModel = signal<UserEditorFormModel>({
    roleIds: this.user.roles.map(({ id }) => id),
  });

  readonly userForm = form(
    this.formModel,
    (schemaPath) => {
      disabled(schemaPath, {
        when: ({ state }) => state.submitting(),
      });
      validate(schemaPath.roleIds, ({ value }) =>
        value().length > 0
          ? null
          : {
              kind: 'required',
              message: 'Seleccione al menos un rol local.',
            },
      );
    },
    {
      submission: {
        action: async (formField) => {
          const response = await firstValueFrom(
            this.userApi.update(
              this.user.id,
              formField().value().roleIds,
            ),
          );
          this.dialogRef.close(response);
        },
      },
    },
  );

  close(): void {
    if (this.userForm().submitting()) return;
    this.dialogRef.close();
  }

  isRoleSelected(id: string): boolean {
    return this.formModel().roleIds.includes(id);
  }

  toggleRole(id: string, checked: boolean): void {
    this.formModel.update((value) => ({
      ...value,
      roleIds: checked
        ? [...new Set([...value.roleIds, id])]
        : value.roleIds.filter((roleId) => roleId !== id),
    }));
    this.userForm.roleIds().markAsTouched();
  }
}
