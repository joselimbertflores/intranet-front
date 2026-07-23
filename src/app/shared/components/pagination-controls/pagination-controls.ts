import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideChevronLeft,
  lucideChevronRight,
  lucideChevronsLeft,
  lucideChevronsRight,
} from '@ng-icons/lucide';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmLabel } from '@spartan-ng/helm/label';

let paginationControlsId = 0;

@Component({
  selector: 'app-pagination-controls',
  imports: [HlmButton, HlmLabel, HlmSelectImports, NgIcon],
  providers: [
    provideIcons({
      lucideChevronLeft,
      lucideChevronRight,
      lucideChevronsLeft,
      lucideChevronsRight,
    }),
  ],
  template: `
    <nav
      class="flex flex-wrap items-center justify-end gap-x-4 gap-y-3 border-t pt-3"
      aria-label="Controles de paginación"
    >
      <p class="text-sm text-muted-foreground">
        {{ firstItem() }}–{{ lastItem() }} de {{ totalItems() }} resultados
      </p>

      <div class="flex items-center gap-2">
        <label hlmLabel class="text-muted-foreground" [for]="pageSizeControlId">
          Por página
        </label>

        <hlm-select [value]="pageSize()" (valueChange)="changePageSize($event)">
          <hlm-select-trigger
            class="w-20"
            size="sm"
            [buttonId]="pageSizeControlId"
          >
            <hlm-select-value />
          </hlm-select-trigger>

          <hlm-select-content *hlmSelectPortal>
            @for (size of pageSizes(); track size) {
              <hlm-select-item [value]="size">
                {{ size }}
              </hlm-select-item>
            }
          </hlm-select-content>
        </hlm-select>
      </div>

      <span class="text-sm text-muted-foreground">
        Página {{ currentPage() }} de {{ totalPages() }}
      </span>

      <div class="flex items-center gap-1">
        @if (showFirstLastButtons()) {
          <button
            hlmBtn
            type="button"
            size="icon-sm"
            variant="outline"
            aria-label="Ir a la primera página"
            [disabled]="!hasPreviousPage()"
            (click)="goToFirstPage()"
          >
            <ng-icon name="lucideChevronsLeft" />
          </button>
        }

        <button
          hlmBtn
          type="button"
          size="icon-sm"
          variant="outline"
          aria-label="Ir a la página anterior"
          [disabled]="!hasPreviousPage()"
          (click)="goToPreviousPage()"
        >
          <ng-icon name="lucideChevronLeft" />
        </button>

        <button
          hlmBtn
          type="button"
          size="icon-sm"
          variant="outline"
          aria-label="Ir a la página siguiente"
          [disabled]="!hasNextPage()"
          (click)="goToNextPage()"
        >
          <ng-icon name="lucideChevronRight" />
        </button>

        @if (showFirstLastButtons()) {
          <button
            hlmBtn
            type="button"
            size="icon-sm"
            variant="outline"
            aria-label="Ir a la última página"
            [disabled]="!hasNextPage()"
            (click)="goToLastPage()"
          >
            <ng-icon name="lucideChevronsRight" />
          </button>
        }
      </div>
    </nav>
  `,
  host: {
    class: 'block',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationControls {
  readonly totalItems = input.required<number>();
  readonly currentPage = model.required<number>();
  readonly pageSize = model.required<number>();
  
  readonly pageSizes = input<number[]>([10, 20, 30, 50]);
  readonly showFirstLastButtons = input(true);

  protected readonly pageSizeControlId = `pagination-page-size-${paginationControlsId++}`;

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalItems() / this.pageSize())),
  );

  protected readonly firstItem = computed(() => {
    if (this.totalItems() === 0) return 0;

    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  protected readonly lastItem = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.totalItems()),
  );

  protected readonly hasPreviousPage = computed(() => this.currentPage() > 1);

  protected readonly hasNextPage = computed(
    () => this.currentPage() < this.totalPages(),
  );

  constructor() {}

  protected goToFirstPage(): void {
    if (!this.hasPreviousPage()) return;

    this.currentPage.set(1);
  }

  protected goToPreviousPage(): void {
    if (!this.hasPreviousPage()) return;

    this.currentPage.update((page) => page - 1);
  }

  protected goToNextPage(): void {
    if (!this.hasNextPage()) return;

    this.currentPage.update((page) => page + 1);
  }

  protected goToLastPage(): void {
    if (!this.hasNextPage()) return;

    this.currentPage.set(this.totalPages());
  }

  protected changePageSize(pageSize: number | undefined | null): void {
    if (pageSize == null || pageSize <= 0) return;

    this.pageSize.set(pageSize);
    this.currentPage.set(1);
  }
}
