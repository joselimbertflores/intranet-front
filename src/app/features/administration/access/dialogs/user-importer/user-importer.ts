import { TitleCasePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';

import {
  AutoCompleteCompleteEvent,
  AutoCompleteModule,
} from 'primeng/autocomplete';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

import { finalize } from 'rxjs';

import { IdentityCandidateResponse } from '../../interfaces';
import { FormUtils } from '../../../../../helpers';
import { UserApi } from '../../services';

@Component({
  selector: 'app-user-importer',
  imports: [
    ReactiveFormsModule,
    AutoCompleteModule,
    MultiSelectModule,
    FloatLabelModule,
    MessageModule,
    ButtonModule,
    SelectModule,
    TitleCasePipe,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './user-importer.html',
})
export class UserImporter {
  private readonly dialogRef = inject(DynamicDialogRef);
  private readonly messageService = inject(MessageService);
  private readonly userApi = inject(UserApi);

  readonly minimumSearchLength = 3;
  readonly formUtils = FormUtils;
  readonly candidates = signal<IdentityCandidateResponse[]>([]);
  readonly isSaving = signal(false);
  readonly importError = signal<string | null>(null);

  readonly form = new FormGroup({
    candidate: new FormControl<IdentityCandidateResponse | null>(
      null,
      Validators.required,
    ),
    roleIds: new FormControl<string[]>([], {
      validators: Validators.required,
    }),
  });

  private readonly selectedCandidateSignal = toSignal(
    this.form.controls.candidate.valueChanges,
    {
      initialValue: this.form.controls.candidate.value,
    },
  );

  roles = toSignal(this.userApi.getRoles(), { initialValue: [] });
  selectedCandidate = computed(() => this.selectedCandidateSignal());

  constructor() {
    effect(() => {
      this.setAutoAssignedRoles();
    });
  }

  searchCandidates(event: AutoCompleteCompleteEvent): void {
    const term = event.query.trim();

    this.candidates.set([]);

    if (term.length < this.minimumSearchLength) return;

    this.userApi.findIdentityCandidates(term).subscribe((candidates) => {
      this.candidates.set(candidates);
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { candidate, roleIds } = this.form.value;

    if (!candidate || !roleIds) return;

    this.isSaving.set(true);
    this.importError.set(null);

    this.userApi
      .importFromIdentity(candidate.externalKey, roleIds)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (user) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Usuario importado',
            detail: `${user.fullName} fue agregado correctamente.`,
            life: 3000,
          });
          this.dialogRef.close(user);
        },
        error: (error: unknown) => {
          this.importError.set(this.getImportErrorMessage(error));
        },
      });
  }

  close(): void {
    this.dialogRef.close();
  }

  private getImportErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'No se pudo importar el usuario. Intente nuevamente.';
    }

    switch (error.status) {
      case 400:
        return 'Los datos de importacion o el rol seleccionado no son validos.';
      case 401:
      case 403:
        return 'No tiene permisos para importar usuarios.';
      case 404:
        return 'El usuario ya no esta disponible en Identity Hub.';
      case 409:
        return 'El usuario ya existe en este cliente.';
      default:
        return 'No se pudo importar el usuario. Intente nuevamente.';
    }
  }

  private setAutoAssignedRoles() {
    const roleIds = this.roles()
      .filter(({ isAutoAssigned }) => isAutoAssigned)
      .map(({ id }) => id);

    if (roleIds.length > 0) {
      this.form.get('roleIds')?.setValue(roleIds);
    }
  }
}
