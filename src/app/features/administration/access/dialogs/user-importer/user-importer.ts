import {
  ChangeDetectionStrategy,
  Component,
  debounced,
  inject,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import {
  disabled,
  form,
  FormRoot,
  validate,
} from '@angular/forms/signals';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { HlmAutocompleteImports } from '@spartan-ng/helm/autocomplete';
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
import { firstValueFrom, of } from 'rxjs';

import { IdentityCandidateResponse, UserResponse } from '../../interfaces';
import { UserApi } from '../../services';

interface UserImporterFormModel {
  externalKey: string | null;
  roleIds: string[];
}

@Component({
  selector: 'app-user-importer',
  imports: [
    FormRoot,
    HlmAutocompleteImports,
    HlmButtonImports,
    HlmCheckbox,
    HlmDialogFooter,
    HlmDialogHeader,
    HlmDialogTitle,
    HlmFieldImports,
    HlmSkeleton,
    HlmSpinner,
  ],
  templateUrl: './user-importer.html',
  host: {
    class: 'flex max-h-[calc(100dvh-4rem)] min-h-0 flex-col',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserImporter {
  private readonly dialogRef =
    inject<BrnDialogRef<UserResponse>>(BrnDialogRef);
  private readonly userApi = inject(UserApi);

  readonly minimumSearchLength = 3;
  readonly searchTerm = signal('');
  readonly debouncedSearchTerm = debounced(this.searchTerm, 350);

  readonly candidatesResource = rxResource({
    params: () => ({ term: this.debouncedSearchTerm.value().trim() }),
    stream: ({ params }) =>
      params.term.length >= this.minimumSearchLength
        ? this.userApi.findIdentityCandidates(params.term)
        : of([]),
  });

  readonly rolesResource = rxResource({
    stream: () => this.userApi.getRoles(),
  });

  readonly selectedCandidate = signal<IdentityCandidateResponse | null>(null);

  readonly formModel = signal<UserImporterFormModel>({
    externalKey: null,
    roleIds: [],
  });

  readonly importerForm = form(
    this.formModel,
    (schemaPath) => {
      disabled(schemaPath, {
        when: ({ state }) => state.submitting(),
      });
      validate(schemaPath.externalKey, ({ value }) =>
        value()
          ? null
          : {
              kind: 'required',
              message: 'Seleccione un usuario de Identity Hub.',
            },
      );
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
          const { externalKey, roleIds } = formField().value();
          if (!externalKey) return;

          const response = await firstValueFrom(
            this.userApi.importFromIdentity(externalKey, roleIds),
          );
          this.dialogRef.close(response);
        },
      },
    },
  );

  close(): void {
    if (this.importerForm().submitting()) return;
    this.dialogRef.close();
  }

  readonly candidateToString = (candidate: IdentityCandidateResponse): string =>
    candidate.fullName;

  readonly isCandidateEqual = (
    candidate: IdentityCandidateResponse,
    selected: IdentityCandidateResponse | null | undefined,
  ): boolean => candidate.externalKey === selected?.externalKey;

  onSearchChange(term: string): void {
    this.searchTerm.set(term);

    const selected = this.selectedCandidate();
    if (selected && term !== this.candidateToString(selected)) {
      this.clearCandidate();
    }
  }

  onCandidateSelected(
    candidate: IdentityCandidateResponse | null | undefined,
  ): void {
    if (!candidate) {
      this.clearCandidate();
      return;
    }

    this.selectedCandidate.set(candidate);
    this.formModel.update((value) => ({
      ...value,
      externalKey: candidate.externalKey,
    }));
    this.importerForm.externalKey().markAsTouched();
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
    this.importerForm.roleIds().markAsTouched();
  }

  private clearCandidate(): void {
    this.selectedCandidate.set(null);
    this.formModel.update((value) => ({ ...value, externalKey: null }));
    this.importerForm.externalKey().markAsTouched();
  }
}
