import { Component, inject, signal } from '@angular/core';
import {
  disabled,
  form,
  FormField,
  FormRoot,
  maxLength,
  minLength,
  validate,
} from '@angular/forms/signals';
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
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { firstValueFrom } from 'rxjs';

import { DirectorySite, DirectorySitePayload } from '../../interfaces';
import { DirectoryDataSource } from '../../services';

export interface DirectorySiteEditorContext {
  site?: DirectorySite;
}

interface DirectorySiteFormModel {
  name: string;
  coordinates: string;
  isActive: boolean;
}

@Component({
  selector: 'app-directory-site-editor',
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
    HlmSpinner,
  ],
  templateUrl: './directory-site-editor.html',
  host: {
    class: 'flex max-h-[calc(100dvh-4rem)] min-h-0 flex-col',
  },
})
export class DirectorySiteEditor {
  private readonly dialogRef =
    inject<BrnDialogRef<DirectorySite>>(BrnDialogRef);
  private readonly dataSource = inject(DirectoryDataSource);
  private readonly context =
    injectBrnDialogContext<DirectorySiteEditorContext>();

  readonly site = this.context.site;
  readonly formModel = signal<DirectorySiteFormModel>({
    name: this.site?.name ?? '',
    coordinates: '',
    isActive: this.site?.isActive ?? true,
  });

  readonly siteForm = form(
    this.formModel,
    (schemaPath) => {
      validate(schemaPath.name, ({ value }) =>
        value().trim()
          ? null
          : {
              kind: 'required',
              message: 'El nombre de la sede es obligatorio.',
            },
      );

      validate(schemaPath.coordinates, ({ value }) => {
        const coordinates = value().trim();
        if (!coordinates) return null;

        return this.parseCoordinates(coordinates)
          ? null
          : {
              kind: 'coordinates',
              message: 'Ingrese coordenadas válidas: latitud, longitud',
            };
      });
    },
    {
      submission: {
        action: async (formField) => {
          const { coordinates, ...props } = formField().value();
          const parsedCoordinates = formField().value().coordinates.trim()
            ? this.parseCoordinates(formField().value().coordinates)
            : null;
          const payload = {
            ...props,
            ...(parsedCoordinates && {
              latitude: parsedCoordinates[0],
              longitude: parsedCoordinates[1],
            }),
          };
          const request = this.site
            ? this.dataSource.updateSite(this.site.id, payload)
            : this.dataSource.createSite(payload);

          const response = await firstValueFrom(request);
          this.dialogRef.close(response);
        },
      },
    },
  );

  close(): void {
    if (!this.siteForm().submitting()) this.dialogRef.close();
  }

  private parseCoordinates(value: string): [number, number] | null {
    const parts = value.split(',').map((part) => part.trim());

    if (parts.length !== 2 || parts.some((part) => !part)) {
      return null;
    }

    const [latitude, longitude] = parts.map(Number);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return null;
    }

    return [latitude, longitude];
  }
}
