import { Component, computed, inject, signal } from '@angular/core';
import {
  applyEach,
  disabled,
  form,
  FormField,
  FormRoot,
  maxLength,
  pattern,
  validate,
} from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideX } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import {
  HlmDialogFooter,
  HlmDialogHeader,
  HlmDialogTitle,
} from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { firstValueFrom } from 'rxjs';

import { DirectoryEntry, DirectorySite } from '../../interfaces';
import { DirectoryDataSource } from '../../services';

export interface DirectoryEntryEditorContext {
  entry?: DirectoryEntry;
  sites: DirectorySite[];
}

interface DirectoryEntryFormModel {
  areaName: string;
  contactLabel: string;
  extensions: string[];
  phones: string[];
  email: string;
  siteId: number | null;
  siteDetails: string;
  isActive: boolean;
}

const CONTACT_NUMBER_PATTERN = /^[0-9+()#*\-\s]*$/;
const EMAIL_PATTERN = /^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-directory-entry-editor',
  imports: [
    FormField,
    FormRoot,
    HlmButton,
    HlmCheckbox,
    HlmDialogFooter,
    HlmDialogHeader,
    HlmDialogTitle,
    HlmFieldImports,
    HlmInput,
    HlmSelectImports,
    HlmSpinner,
    NgIcon,
  ],
  providers: [provideIcons({ lucidePlus, lucideX })],
  templateUrl: './directory-entry-editor.html',
  host: {
    class: 'flex max-h-[calc(100dvh-4rem)] min-h-0 flex-col',
  },
})
export class DirectoryEntryEditor {
  private readonly dialogRef =
    inject<BrnDialogRef<DirectoryEntry>>(BrnDialogRef);
  private readonly dataSource = inject(DirectoryDataSource);
  private readonly context =
    injectBrnDialogContext<DirectoryEntryEditorContext>();

  readonly entry = this.context.entry;
  readonly availableSites = computed(() => {
    const sites = this.entry
      ? this.context.sites
      : this.context.sites.filter(({ isActive }) => isActive);
    const currentSite = this.entry?.site;

    if (!currentSite || sites.some(({ id }) => id === currentSite.id)) {
      return sites;
    }

    return [...sites, currentSite];
  });
  readonly siteNames = computed(
    () => new Map(this.availableSites().map(({ id, name }) => [id, name])),
  );

  readonly formModel = signal<DirectoryEntryFormModel>({
    areaName: this.entry?.areaName ?? '',
    contactLabel: this.entry?.contactLabel ?? '',
    extensions: this.entry?.extensions.length
      ? [...this.entry.extensions]
      : [''],
    phones: this.entry?.phones.length ? [...this.entry.phones] : [''],
    email: this.entry?.email ?? '',
    siteId: this.entry?.siteId ?? null,
    siteDetails: this.entry?.siteDetails ?? '',
    isActive: this.entry?.isActive ?? true,
  });

  readonly entryForm = form(
    this.formModel,
    (schemaPath) => {
      disabled(schemaPath, {
        when: ({ state }) => state.submitting(),
      });

      validate(schemaPath.areaName, ({ value }) =>
        value().trim()
          ? null
          : {
              kind: 'required',
              message: 'El área o dependencia es obligatoria.',
            },
      );
      maxLength(schemaPath.areaName, 160, {
        message: 'El área admite hasta 160 caracteres.',
      });
      maxLength(schemaPath.contactLabel, 160, {
        message: 'La referencia admite hasta 160 caracteres.',
      });
      maxLength(schemaPath.email, 160, {
        message: 'El correo admite hasta 160 caracteres.',
      });
      pattern(schemaPath.email, EMAIL_PATTERN, {
        message: 'Ingresa un correo válido.',
      });
      maxLength(schemaPath.siteDetails, 200, {
        message: 'El detalle admite hasta 200 caracteres.',
      });

      applyEach(schemaPath.extensions, (extension) => {
        maxLength(extension, 30, {
          message: 'Cada interno admite hasta 30 caracteres.',
        });
        pattern(extension, CONTACT_NUMBER_PATTERN, {
          message: 'Usa números y símbolos telefónicos válidos.',
        });
      });

      applyEach(schemaPath.phones, (phone) => {
        maxLength(phone, 40, {
          message: 'Cada teléfono admite hasta 40 caracteres.',
        });
        pattern(phone, CONTACT_NUMBER_PATTERN, {
          message: 'Usa números y símbolos telefónicos válidos.',
        });
      });

      validate(schemaPath, ({ value }) => {
        const entry = value();
        const hasContactMethod =
          entry.extensions.some((item) => item.trim()) ||
          entry.phones.some((item) => item.trim()) ||
          entry.email.trim();

        return hasContactMethod
          ? null
          : {
              kind: 'contactMethodRequired',
              message:
                'Agrega al menos un interno, teléfono o correo de contacto.',
            };
      });
    },
    {
      submission: {
        action: async (formField) => {
          const payload = this.buildPayload(formField().value());
          const request = this.entry
            ? this.dataSource.update(this.entry.id, payload)
            : this.dataSource.create(payload);

          const response = await firstValueFrom(request);
          this.dialogRef.close(response);
        },
      },
    },
  );

  addExtension(): void {
    this.formModel.update((value) => ({
      ...value,
      extensions: [...value.extensions, ''],
    }));
  }

  removeExtension(index: number): void {
    this.formModel.update((value) => ({
      ...value,
      extensions: value.extensions.filter(
        (_, extensionIndex) => extensionIndex !== index,
      ),
    }));
  }

  addPhone(): void {
    this.formModel.update((value) => ({
      ...value,
      phones: [...value.phones, ''],
    }));
  }

  removePhone(index: number): void {
    this.formModel.update((value) => ({
      ...value,
      phones: value.phones.filter((_, phoneIndex) => phoneIndex !== index),
    }));
  }

  close(): void {
    if (!this.entryForm().submitting()) this.dialogRef.close();
  }

  private buildPayload(value: DirectoryEntryFormModel) {
    return {
      areaName: value.areaName.trim(),
      contactLabel: value.contactLabel.trim() || null,
      extensions: this.cleanValues(value.extensions),
      phones: this.cleanValues(value.phones),
      email: value.email.trim() || null,
      siteId: value.siteId,
      siteDetails: value.siteDetails.trim() || null,
      isActive: value.isActive,
    };
  }

  private cleanValues(values: string[]): string[] {
    return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
  }
}
