import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import {
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  applyEach,
  FormField,
  FormRoot,
  maxLength,
  minLength,
  pattern,
  required,
  form,
} from '@angular/forms/signals';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { HlmButton } from '@spartan-ng/helm/button';
import {
  HlmDialogFooter,
  HlmDialogHeader,
  HlmDialogTitle,
} from '@spartan-ng/helm/dialog';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import {
  lucideAppWindow,
  lucideBookOpen,
  lucideCalendarDays,
  lucideCarFront,
  lucideChartNoAxesColumn,
  lucideCircleAlert,
  lucideCircleHelp,
  lucideClipboardList,
  lucideExternalLink,
  lucideFileText,
  lucideGripVertical,
  lucideLandmark,
  lucideMail,
  lucideRefreshCw,
  lucideTrash2,
  lucideUserRound,
} from '@ng-icons/lucide';
import { finalize, firstValueFrom } from 'rxjs';

import {
  isQuickAccessIconKey,
  QUICK_ACCESS_ICON_CATALOG,
  QUICK_ACCESS_ICON_OPTIONS,
  QuickAccessIconKey,
} from '../../constants/quick-access-icons';
import { QuickAccessBatchItem, QuickAccessResponse } from '../../interfaces';
import { ContentSettingsDataSource } from '../../services';

const QUICK_ACCESS_MAX_ITEMS = 100;
const QUICK_ACCESS_DEFAULT_ICON_KEY: QuickAccessIconKey = 'external-link';
const QUICK_ACCESS_DEFAULT_BACKGROUND_COLOR = '#477998';

interface QuickAccessFormData {
  id: number | null;
  title: string;
  description: string;
  iconKey: QuickAccessIconKey;
  backgroundColor: string;
  url: string;
  isActive: boolean;
}

@Component({
  selector: 'app-quick-access-editor',
  imports: [
    DragDropModule,
    FormField,
    FormRoot,
    HlmButton,
    HlmCheckbox,
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
  templateUrl: './quick-access-editor.html',
  styles: `
    .app-drag-card.cdk-drag-preview {
      box-sizing: border-box;
      opacity: 1;
      box-shadow: 0 12px 24px rgb(0 0 0 / 0.18);
    }

    .app-drag-card.cdk-drag-placeholder {
      opacity: 0.35;
    }

    .app-drag-card.cdk-drag-animating,
    .app-drag-list.cdk-drop-list-dragging
      .app-drag-card:not(.cdk-drag-placeholder) {
      transition: transform 220ms cubic-bezier(0, 0, 0.2, 1);
    }
  `,
  providers: [
    provideIcons({
      lucideAppWindow,
      lucideBookOpen,
      lucideCalendarDays,
      lucideCarFront,
      lucideChartNoAxesColumn,
      lucideCircleAlert,
      lucideCircleHelp,
      lucideClipboardList,
      lucideExternalLink,
      lucideFileText,
      lucideGripVertical,
      lucideLandmark,
      lucideMail,
      lucideRefreshCw,
      lucideTrash2,
      lucideUserRound,
    }),
  ],
  host: {
    class: 'flex min-h-0 flex-col gap-4',
  },
})
export class QuickAccessEditor implements OnInit {
  private readonly dialogRef =
    inject<BrnDialogRef<QuickAccessResponse[]>>(BrnDialogRef);
  private readonly contentDataSource = inject(ContentSettingsDataSource);
  private readonly destroyRef = inject(DestroyRef);

  readonly isLoading = signal(false);
  readonly deletedQuickAccessIds = signal<number[]>([]);
  readonly quickAccessIconOptions = QUICK_ACCESS_ICON_OPTIONS;
  readonly maxQuickAccessItems = QUICK_ACCESS_MAX_ITEMS;
  readonly scrollContainer =
    viewChild.required<ElementRef<HTMLElement>>('scrollContainer');

  readonly quickAccessFormModel = signal<QuickAccessFormData[]>([]);

  readonly quickAccessForm = form(
    this.quickAccessFormModel,
    (schemaPath) => {
      minLength(schemaPath, 1, {
        message: 'Debe existir al menos un acceso rápido',
      });
      maxLength(schemaPath, QUICK_ACCESS_MAX_ITEMS, {
        message:
          'No puede registrar más de ' +
          QUICK_ACCESS_MAX_ITEMS +
          ' accesos rápidos',
      });

      applyEach(schemaPath, (item) => {
        required(item.title, { message: 'El título es requerido' });
        maxLength(item.title, 80, { message: 'Máximo 80 caracteres' });

        maxLength(item.description, 200, {
          message: 'Máximo 200 caracteres',
        });

        required(item.iconKey, { message: 'Seleccione un icono' });

        required(item.backgroundColor, {
          message: 'Seleccione un color de fondo',
        });
        pattern(item.backgroundColor, /^#[0-9A-Fa-f]{6}$/, {
          message: 'Ingrese un color hexadecimal válido (#RRGGBB)',
        });

        required(item.url, { message: 'La URL es requerida' });
        maxLength(item.url, 2048, { message: 'Máximo 2048 caracteres' });
        pattern(item.url, /^https?:\/\/[^\s]+$/i, {
          message: 'Ingrese una URL HTTP o HTTPS válida',
        });
      });
    },
    {
      submission: {
        action: async (field) => {
          const response = await firstValueFrom(
            this.contentDataSource.saveQuickAccessItems(
              this.buildItemsToSave(field().value()),
              this.deletedQuickAccessIds(),
            ),
          );

          this.dialogRef.close(response);
        },
      },
    },
  );

  ngOnInit(): void {
    this.loadQuickAccess();
  }

  close(): void {
    this.dialogRef.close();
  }

  addQuickAccess(): void {
    if (this.quickAccessForm().value().length >= QUICK_ACCESS_MAX_ITEMS) return;

    this.quickAccessFormModel.update((items) => [
      ...items,
      {
        id: null,
        title: '',
        description: '',
        iconKey: QUICK_ACCESS_DEFAULT_ICON_KEY,
        backgroundColor: QUICK_ACCESS_DEFAULT_BACKGROUND_COLOR,
        url: '',
        isActive: true,
      },
    ]);

    setTimeout(() => this.scrollToBottom());
  }

  removeQuickAccess(index: number): void {
    const quickAccess = this.quickAccessFormModel()[index];

    if (!quickAccess) return;

    const id = quickAccess.id;
    if (id !== null) {
      this.deletedQuickAccessIds.update((ids) =>
        ids.includes(id) ? ids : [...ids, id],
      );
    }

    this.quickAccessFormModel.update((items) =>
      items.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  drop(event: CdkDragDrop<unknown[]>): void {
    if (event.previousIndex === event.currentIndex) return;

    this.quickAccessFormModel.update((items) => {
      const reorderedItems = [...items];
      moveItemInArray(reorderedItems, event.previousIndex, event.currentIndex);
      return reorderedItems;
    });
  }

  iconConfig(iconKey: QuickAccessIconKey) {
    return QUICK_ACCESS_ICON_CATALOG[iconKey];
  }

  loadQuickAccess(): void {
    this.isLoading.set(true);
    this.contentDataSource
      .getQuickAccess()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (quickAccessItems) => {
          this.deletedQuickAccessIds.set([]);
          this.quickAccessFormModel.set(
            quickAccessItems.map((item) => ({
              id: item.id,
              title: item.title,
              description: item.description ?? '',
              iconKey: isQuickAccessIconKey(item.iconKey)
                ? item.iconKey
                : QUICK_ACCESS_DEFAULT_ICON_KEY,
              backgroundColor:
                item.backgroundColor ?? QUICK_ACCESS_DEFAULT_BACKGROUND_COLOR,
              url: item.url,
              isActive: item.isActive,
            })),
          );
        },
      });
  }

  private buildItemsToSave(
    items: QuickAccessFormData[],
  ): QuickAccessBatchItem[] {
    return items.map((item) => ({
      ...(item.id !== null && { id: item.id }),
      title: item.title.trim(),
      description: item.description.trim() || undefined,
      iconKey: item.iconKey,
      backgroundColor: item.backgroundColor,
      url: item.url.trim(),
      isActive: item.isActive,
    }));
  }

  private scrollToBottom(): void {
    const element = this.scrollContainer().nativeElement;
    element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
  }
}
