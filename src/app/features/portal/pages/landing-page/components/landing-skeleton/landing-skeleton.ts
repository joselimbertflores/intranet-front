import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';

@Component({
  selector: 'landing-skeleton',
  imports: [HlmSkeletonImports],
  host: { class: 'block' },
  template: `
    <div aria-label="Cargando contenido de la intranet" aria-busy="true">
      <section
        class="landing-hero-skeleton px-5 py-12 sm:px-8"
        aria-hidden="true"
      >
        <div
          class="mx-auto flex h-full w-full max-w-7xl items-end sm:items-center"
        >
          <div class="w-full max-w-2xl">
            <div hlmSkeleton class="h-12 w-4/5 sm:h-16"></div>
            <div hlmSkeleton class="mt-5 h-5 w-3/5"></div>
            <div hlmSkeleton class="mt-3 h-5 w-2/5"></div>
            <div hlmSkeleton class="mt-7 h-10 w-36"></div>
          </div>
        </div>
      </section>

      <section
        class="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8"
        aria-hidden="true"
      >
        <div hlmSkeleton class="mx-auto h-9 w-64"></div>
        <div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @for (item of quickAccessSkeletons; track $index) {
            <div hlmSkeleton class="h-52 rounded-2xl"></div>
          }
        </div>
      </section>

      <section class="featured-skeleton px-5 py-14 sm:px-8" aria-hidden="true">
        <div
          class="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[minmax(13rem,0.7fr)_minmax(0,1.8fr)] lg:items-center lg:gap-12"
        >
          <div>
            <div hlmSkeleton class="h-9 w-56"></div>
            <div hlmSkeleton class="mt-4 h-5 w-full max-w-72"></div>
          </div>
          <div hlmSkeleton class="h-72 w-full rounded-3xl sm:h-96"></div>
        </div>
      </section>

      <section
        class="communications-skeleton px-5 py-14 sm:px-8"
        aria-hidden="true"
      >
        <div class="mx-auto w-full max-w-7xl">
          <div hlmSkeleton class="h-9 w-72"></div>
          <div class="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            @for (item of communicationSkeletons; track $index) {
              <div hlmSkeleton class="h-80 rounded-2xl"></div>
            }
          </div>
        </div>
      </section>

      <section class="documents-skeleton px-5 py-14 sm:px-8" aria-hidden="true">
        <div class="mx-auto w-full max-w-7xl">
          <div hlmSkeleton class="h-9 w-80"></div>
          <div class="mt-7 grid gap-2">
            @for (item of contentSkeletons; track $index) {
              <div hlmSkeleton class="h-16 rounded-xl"></div>
            }
          </div>
        </div>
      </section>
    </div>
  `,
  styles: `
    .landing-hero-skeleton {
      height: clamp(28rem, 54svh, 35rem);
      background:
        linear-gradient(
          90deg,
          rgb(5 42 61 / 0.96),
          rgb(6 51 74 / 0.78) 48%,
          rgb(6 51 74 / 0.28)
        ),
        #06334a;
    }

    .featured-skeleton {
      background: linear-gradient(
        118deg,
        color-mix(in oklch, var(--landing-emerald) 11%, var(--background)),
        color-mix(in oklch, var(--landing-gold) 24%, var(--landing-cream))
      );
    }

    .documents-skeleton {
      --accent: color-mix(in srgb, var(--color-white) 18%, transparent);
      background: linear-gradient(
        118deg,
        color-mix(
          in oklch,
          var(--landing-emerald) 64%,
          var(--landing-forest)
        ),
        color-mix(in oklch, var(--landing-teal) 76%, var(--landing-forest))
      );
    }

    .communications-skeleton {
      background: linear-gradient(
        112deg,
        color-mix(in oklch, var(--landing-cream) 94%, var(--background)),
        color-mix(in oklch, var(--landing-sand) 64%, var(--background))
      );
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingSkeleton {
  protected readonly quickAccessSkeletons = Array.from({ length: 6 });
  protected readonly communicationSkeletons = Array.from({ length: 3 });
  protected readonly contentSkeletons = Array.from({ length: 4 });
}
