import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'landing-skeleton',
  template: `
    <div
      class="animate-pulse bg-surface-0 motion-reduce:animate-none"
      role="status"
      aria-live="polite"
    >
      <span class="sr-only">Cargando contenido de la Intranet</span>

      <section class="flex h-[clamp(430px,62vh,620px)] items-end bg-primary-950 px-4 pb-20 sm:items-center sm:px-6 sm:pb-0 lg:px-8">
        <div class="mx-auto w-full max-w-7xl">
          <div class="h-12 max-w-2xl rounded-xl bg-white/15 sm:h-16"></div>
          <div class="mt-5 h-5 max-w-xl rounded-lg bg-white/10"></div>
          <div class="mt-3 h-5 max-w-md rounded-lg bg-white/10"></div>
          <div class="mt-7 h-12 w-36 rounded-xl bg-primary-500/60"></div>
        </div>
      </section>

      <section class="relative -mt-6 rounded-t-[1.75rem] bg-surface-0 px-4 py-12 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-7xl">
          <div class="mx-auto h-9 w-64 rounded-lg bg-surface-200"></div>
          <div class="mx-auto mt-3 h-4 w-80 max-w-full rounded bg-surface-100"></div>
          <div class="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            @for (item of placeholders; track item) {
              <div class="min-h-40 rounded-2xl bg-surface-100 p-5">
                <div class="mx-auto size-14 rounded-2xl bg-surface-200"></div>
                <div class="mx-auto mt-5 h-4 w-3/4 rounded bg-surface-200"></div>
              </div>
            }
          </div>
        </div>
      </section>

      <section class="bg-[var(--portal-mint)] px-4 py-14 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-7xl">
          <div class="mb-7 h-9 w-72 max-w-full rounded-lg bg-primary-200/70"></div>
          <div class="h-[25rem] rounded-[1.75rem] bg-primary-900/75"></div>
        </div>
      </section>

      <section class="px-4 py-14 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-7xl">
          <div class="mb-8 h-9 w-80 max-w-full rounded-lg bg-surface-200"></div>
          <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            @for (item of communicationPlaceholders; track item) {
              <div class="min-h-[32rem] overflow-hidden rounded-2xl bg-surface-100">
                <div class="h-72 bg-surface-200"></div>
                <div class="space-y-4 p-5">
                  <div class="h-5 w-24 rounded bg-surface-200"></div>
                  <div class="h-5 w-full rounded bg-surface-200"></div>
                  <div class="h-5 w-4/5 rounded bg-surface-200"></div>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <section class="bg-[var(--portal-cream)] px-4 py-14 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-7xl">
          <div class="mb-7 h-9 w-96 max-w-full rounded-lg bg-amber-200/70"></div>
          <div class="overflow-hidden rounded-2xl bg-white/80">
            @for (item of documentPlaceholders; track item) {
              <div class="flex items-center gap-4 border-b border-amber-100 p-4 last:border-b-0">
                <div class="size-12 shrink-0 rounded-xl bg-surface-200"></div>
                <div class="flex-1">
                  <div class="h-4 w-3/5 rounded bg-surface-200"></div>
                  <div class="mt-2 h-3 w-2/5 rounded bg-surface-100"></div>
                </div>
                <div class="hidden h-10 w-28 rounded-xl bg-primary-200 sm:block"></div>
              </div>
            }
          </div>
        </div>
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingSkeleton {
  readonly placeholders = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  readonly communicationPlaceholders = [1, 2, 3, 4];
  readonly documentPlaceholders = [1, 2, 3, 4, 5];
}
