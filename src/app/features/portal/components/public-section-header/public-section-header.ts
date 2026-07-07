import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'public-section-header',
  template: `
    <header
      class="relative overflow-hidden bg-linear-to-br from-primary-950 via-primary-900 to-primary-700 py-5 text-white shadow-inner sm:py-6 lg:py-7"
    >
      <div
        class="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        <svg
          class="absolute inset-0 h-full w-full opacity-[0.10]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="section-header-dots"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="2"
                cy="2"
                r="1.4"
                fill="currentColor"
                class="text-white"
              />
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill="url(#section-header-dots)" />
        </svg>
      </div>

      <div
        class="pointer-events-none absolute inset-0 z-10 bg-linear-to-r from-primary-950/50 via-transparent to-primary-600/20"
        aria-hidden="true"
      ></div>

      <div
        class="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-px bg-linear-to-r from-transparent via-white/20 to-transparent"
        aria-hidden="true"
      ></div>

      <div class="relative z-20 mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <h1
          class="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl"
        >
          {{ title() }}
        </h1>

        <p
          class="mt-1 max-w-2xl text-sm leading-relaxed text-primary-100 sm:text-base"
        >
          {{ description() }}
        </p>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicSectionHeader {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}
