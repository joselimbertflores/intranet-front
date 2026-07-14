import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'public-section-header',
  template: `
    <header class="public-section-header">
      <div
        class="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7"
      >
        <h1
          class="text-2xl font-bold tracking-tight text-primary-950 sm:text-3xl"
        >
          {{ title() }}
        </h1>

        @if (description(); as description) {
          <p
            class="mt-1 max-w-2xl text-sm leading-relaxed text-surface-700 sm:text-base"
          >
            {{ description }}
          </p>
        }
      </div>
    </header>
  `,
  styles: `
    :host {
      --public-section-header-champagne: #b49a68;
      display: block;
    }

    .public-section-header {
      width: 100%;
      border-bottom: 1px solid
        color-mix(in srgb, var(--p-surface-300) 60%, transparent);
      background-color: var(--p-surface-0);
      background-image:
        radial-gradient(
          circle at 0% 45%,
          color-mix(in srgb, var(--p-primary-100) 72%, transparent) 0%,
          transparent 58%
        ),
        radial-gradient(
          circle at 100% 55%,
          color-mix(
              in srgb,
              var(--public-section-header-champagne) 24%,
              transparent
            )
            0%,
          transparent 56%
        ),
        linear-gradient(
          100deg,
          color-mix(in srgb, var(--p-primary-50) 42%, var(--p-surface-0)) 0%,
          var(--p-surface-0) 50%,
          color-mix(
              in srgb,
              var(--public-section-header-champagne) 9%,
              var(--p-surface-0)
            )
            100%
        );
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicSectionHeader {
  readonly title = input.required<string>();
  readonly description = input<string>();
}
