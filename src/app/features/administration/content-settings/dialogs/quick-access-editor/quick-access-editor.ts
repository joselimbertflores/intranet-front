import { Component, inject, signal } from '@angular/core';
import {
  FormField,
  FormRoot,
  form,
  maxLength,
  pattern,
  required,
  validate,
} from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideAppWindow,
  lucideBookOpen,
  lucideCalendarDays,
  lucideCarFront,
  lucideChartNoAxesColumn,
  lucideCircleHelp,
  lucideClipboardList,
  lucideExternalLink,
  lucideFileText,
  lucideLandmark,
  lucideMail,
  lucideUserRound,
} from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import {
  HlmDialogDescription,
  HlmDialogFooter,
  HlmDialogHeader,
  HlmDialogTitle,
} from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { firstValueFrom } from 'rxjs';

import {
  QUICK_ACCESS_ICON_CATALOG,
  QUICK_ACCESS_ICON_OPTIONS,
  QuickAccessIconKey,
} from '../../constants/quick-access-icons';
import { QuickAccessResponse, QuickAccessToSave } from '../../interfaces';
import { ContentSettingsDataSource } from '../../services';

const DEFAULT_ICON_KEY: QuickAccessIconKey = 'external-link';
const DEFAULT_BACKGROUND_COLOR = '#477998';

interface QuickAccessFormData {
  title: string;
  description: string;
  iconKey: QuickAccessIconKey;
  backgroundColor: string;
  url: string;
  isActive: boolean;
}

interface QuickAccessEditorContext {
  quickAccess?: QuickAccessResponse;
}

@Component({
  selector: 'app-quick-access-editor',
  imports: [
    FormField,
    FormRoot,
    HlmButton,
    HlmCheckbox,
    HlmDialogDescription,
    HlmDialogFooter,
    HlmDialogHeader,
    HlmDialogTitle,
    HlmFieldImports,
    HlmInputImports,
    HlmSelectImports,
    HlmSpinner,
    HlmTextareaImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideAppWindow,
      lucideBookOpen,
      lucideCalendarDays,
      lucideCarFront,
      lucideChartNoAxesColumn,
      lucideCircleHelp,
      lucideClipboardList,
      lucideExternalLink,
      lucideFileText,
      lucideLandmark,
      lucideMail,
      lucideUserRound,
    }),
  ],
  templateUrl: './quick-access-editor.html',
  host: {
    class: 'flex max-h-[calc(100dvh-4rem)] flex-col',
  },
})
export class QuickAccessEditor {
  private readonly dialogRef =
    inject<BrnDialogRef<QuickAccessResponse>>(BrnDialogRef);
  private readonly dataSource = inject(ContentSettingsDataSource);
  private readonly context = injectBrnDialogContext<QuickAccessEditorContext>();

  readonly quickAccess = this.context.quickAccess;
  readonly iconOptions = QUICK_ACCESS_ICON_OPTIONS;
  readonly formModel = signal<QuickAccessFormData>({
    title: this.quickAccess?.title ?? '',
    description: this.quickAccess?.description ?? '',
    iconKey: this.quickAccess?.iconKey ?? DEFAULT_ICON_KEY,
    backgroundColor:
      this.quickAccess?.backgroundColor ?? DEFAULT_BACKGROUND_COLOR,
    url: this.quickAccess?.url ?? '',
    isActive: this.quickAccess?.isActive ?? true,
  });

  readonly quickAccessForm = form(
    this.formModel,
    (path) => {
      validate(path.title, ({ value }) =>
        value().trim()
          ? null
          : { kind: 'required', message: 'El título es obligatorio' },
      );
      maxLength(path.title, 80, {
        message: 'El título admite hasta 80 caracteres',
      });
      maxLength(path.description, 200, {
        message: 'La descripción admite hasta 200 caracteres',
      });
      required(path.iconKey, { message: 'Selecciona un icono' });
      required(path.backgroundColor, { message: 'Selecciona un color' });
      pattern(path.backgroundColor, /^#[0-9A-Fa-f]{6}$/, {
        message: 'Usa un color hexadecimal válido (#RRGGBB)',
      });
      required(path.url, { message: 'La URL es obligatoria' });
      maxLength(path.url, 2048, {
        message: 'La URL admite hasta 2048 caracteres',
      });
      pattern(path.url, /^https?:\/\/[^\s]+$/i, {
        message: 'Ingresa una URL HTTP o HTTPS válida',
      });
    },
    {
      submission: {
        action: async (field) => {
          const payload = this.buildPayload(field().value());
          const request = this.quickAccess
            ? this.dataSource.updateQuickAccess(this.quickAccess.id, payload)
            : this.dataSource.createQuickAccess(payload);
          this.dialogRef.close(await firstValueFrom(request));
        },
      },
    },
  );

  iconConfig(iconKey: QuickAccessIconKey) {
    return QUICK_ACCESS_ICON_CATALOG[iconKey];
  }

  isFieldInvalid(fieldName: keyof QuickAccessFormData): boolean {
    const field = this.quickAccessForm[fieldName]();
    return field.touched() && field.errors().length > 0;
  }

  close(): void {
    this.dialogRef.close();
  }

  private buildPayload(value: QuickAccessFormData): QuickAccessToSave {
    return {
      title: value.title.trim(),
      description: value.description.trim() || null,
      iconKey: value.iconKey,
      backgroundColor: value.backgroundColor.toUpperCase(),
      url: value.url.trim(),
      isActive: value.isActive,
    };
  }
}
