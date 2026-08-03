import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'public-page-header',
  template: `
    <header class="public-page-header">
      <div
        class="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8"
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
      background-color: red;
      background-image: linear-gradient(
        105deg,
        color-mix(in oklch, var(--primary) 11%, var(--background)) 0%,
        color-mix(in oklch, var(--primary) 3%, var(--background)) 54%,
        color-mix(in oklch, var(--secondary) 32%, var(--background)) 100%
      );
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicPageHeader {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}
