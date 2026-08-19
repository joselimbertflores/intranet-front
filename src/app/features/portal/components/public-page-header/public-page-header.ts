import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'public-page-header',
  template: `
    <header class="public-page-header">
      <div
        class="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 sm:py-4 lg:px-8"
      >
        <div class="max-w-3xl">
          <h1
            class="text-2xl font-bold leading-tight tracking-tight text-primary sm:text-3xl"
          >
            {{ title() }}
          </h1>

          <p
            class="mt-1.5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg"
          >
            {{ description() }}
          </p>
        </div>
      </div>
    </header>
  `,
  styles: `
    :host {
      display: block;
    }

    .public-page-header {
      width: 100%;
      border-bottom: 1px solid var(--border);
      background-color: var(--background);
      background-image: linear-gradient(
        100deg,
        color-mix(in oklch, var(--primary) 9%, var(--background)) 0%,
        color-mix(in oklch, var(--portal-mint) 42%, var(--background)) 54%,
        color-mix(in oklch, var(--portal-amber) 93%, var(--color-orange-600)) 100%
      );
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicPageHeader {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}
