import {
  Component,
  ElementRef,
  inject,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';

import { QuickAccessBatchItem, QuickAccessResponse } from '../../interfaces';
import { CustomFormValidators, FormUtils } from '../../../../../helpers';
import { ContentSettingsDataSource } from '../../services';

export const QUICK_ACCESS_DEFAULT_ICON_KEY = 'link';

export const QUICK_ACCESS_ICONS = {
  link: {
    label: 'Enlace',
    icon: 'ui-icon ui-icon-link',
  },
  external: {
    label: 'Sistema externo',
    icon: 'ui-icon ui-icon-external-link',
  },
  application: {
    label: 'Aplicación',
    icon: 'ui-icon ui-icon-desktop',
  },
  email: {
    label: 'Correo',
    icon: 'ui-icon ui-icon-envelope',
  },
  document: {
    label: 'Documento',
    icon: 'ui-icon ui-icon-file',
  },
  form: {
    label: 'Formulario',
    icon: 'ui-icon ui-icon-list-check',
  },
  book: {
    label: 'Libro / Gaceta',
    icon: 'ui-icon ui-icon-book',
  },
  support: {
    label: 'Soporte',
    icon: 'ui-icon ui-icon-question-circle',
  },
  dashboard: {
    label: 'Dashboard',
    icon: 'ui-icon ui-icon-chart-line',
  },
  report: {
    label: 'Reporte',
    icon: 'ui-icon ui-icon-chart-bar',
  },
  user: {
    label: 'Usuario',
    icon: 'ui-icon ui-icon-user',
  },
  calendar: {
    label: 'Calendario',
    icon: 'ui-icon ui-icon-calendar',
  },
  settings: {
    label: 'Configuración',
    icon: 'ui-icon ui-icon-cog',
  },
} as const;

export type QuickAccessIconKey = keyof typeof QUICK_ACCESS_ICONS;

@Component({
  selector: 'app-quick-access-editor',
  imports: [ReactiveFormsModule, CommonModule, DragDropModule],
  templateUrl: './quick-access-editor.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  // providers: [ConfirmationService],
})
export class QuickAccessEditor {
  private readonly formBuilder = inject(FormBuilder);
  // private readonly dialogRef = inject(DynamicDialogRef);
  private readonly contentDataSource = inject(ContentSettingsDataSource);
  // private readonly confirmationService = inject(ConfirmationService);

  readonly iconOptions = Object.entries(QUICK_ACCESS_ICONS).map(
    ([value, config]) => ({
      label: config.label,
      value,
      icon: config.icon,
    }),
  );

  readonly form: FormGroup = this.formBuilder.nonNullable.group({
    items: this.formBuilder.array([], CustomFormValidators.minLengthArray(1)),
  });
  readonly scrollContainer = viewChild.required<ElementRef>('scrollContainer');
  readonly formUtils = FormUtils;

  ngOnInit(): void {
    this.loadForm();
  }

  save(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();

    const items: QuickAccessBatchItem[] = this.itemsFormArray
      .getRawValue()
      .map((item) => ({
        ...(item.id ? { id: item.id } : {}),
        title: item.title,
        description: item.description?.trim() || undefined,
        iconKey: item.iconKey,
        url: item.url,
        isActive: item.isActive,
      }));

    this.contentDataSource.replaceQuickAccessItems(items).subscribe(() => {
      // this.dialogRef.close();
    });
  }

  close(): void {
    // this.dialogRef.close();
  }

  addItem(): void {
    if (this.itemsFormArray.length >= 12) return;
    this.itemsFormArray.push(this.createItemGroup());
    setTimeout(() => this.scrollToBottom());
  }

  removeItem(index: number): void {
    const id = this.itemsFormArray.at(index).get('id')?.value as number | null;
    if (!id) {
      this.itemsFormArray.removeAt(index);
      return;
    }
    // this.confirmationService.confirm({
    //   message: '¿Esta seguro que desea eliminar el elemento?',
    //   header: 'Eliminar banner',
    //   rejectButtonProps: {
    //     label: 'Cancelar',
    //     severity: 'secondary',
    //     outlined: true,
    //   },
    //   acceptButtonProps: {
    //     label: 'Aceptar',
    //   },
    //   accept: () => {
    //     this.contentDataSource.removeQuickAccess(id).subscribe(() => {
    //       this.itemsFormArray.removeAt(index);
    //     });
    //   },
    // });
  }

  drop(event: CdkDragDrop<object[]>): void {
    moveItemInArray(
      this.itemsFormArray.controls,
      event.previousIndex,
      event.currentIndex,
    );
    this.itemsFormArray.updateValueAndValidity();
  }

  get itemsFormArray(): FormArray {
    return this.form.get('items') as FormArray;
  }

  getQuickAccessIcon(iconKey?: string | null): string {
    return (
      QUICK_ACCESS_ICONS[iconKey as QuickAccessIconKey]?.icon ??
      QUICK_ACCESS_ICONS[QUICK_ACCESS_DEFAULT_ICON_KEY].icon
    );
  }

  private createItemGroup(data?: Partial<QuickAccessResponse>): FormGroup {
    return this.formBuilder.group({
      id: [data?.id ?? null],
      title: [
        data?.title ?? '',
        [Validators.required, Validators.maxLength(120)],
      ],
      description: [data?.description ?? ''],
      iconKey: [
        data?.iconKey ?? QUICK_ACCESS_DEFAULT_ICON_KEY,
        Validators.required,
      ],
      url: [
        data?.url ?? '',
        [Validators.required, Validators.pattern(/^https?:\/\/.+/i)],
      ],
      isActive: [data?.isActive ?? true],
    });
  }

  private loadForm(): void {
    this.contentDataSource.getQuickAccess().subscribe((data) => {
      data.forEach((item) => {
        this.itemsFormArray.push(this.createItemGroup(item));
      });
    });
  }

  private scrollToBottom(): void {
    const el = this.scrollContainer().nativeElement;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }
}
