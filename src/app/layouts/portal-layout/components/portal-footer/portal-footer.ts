import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideFacebook,
  lucideGlobe,
  lucideInstagram,
  lucideMail,
  lucideMapPin,
  lucideMusic2,
  lucidePhone,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';

import { InstitutionalLogo } from '../../../../shared/components/institutional-logo/institutional-logo';

interface OfficialChannel {
  label: string;
  href: string;
  icon: string;
}

@Component({
  selector: 'portal-footer',
  imports: [HlmButtonImports, InstitutionalLogo, NgIcon],
  providers: [
    provideIcons({
      lucideFacebook,
      lucideGlobe,
      lucideInstagram,
      lucideMail,
      lucideMapPin,
      lucideMusic2,
      lucidePhone,
    }),
  ],
  template: `
    <footer
      class="portal-footer border-t border-sidebar-border bg-sidebar text-sidebar-foreground"
    >
      <div
        class="mx-auto grid w-full max-w-7xl gap-8 px-5 py-8 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.15fr_1.35fr_0.8fr]"
      >
        <section aria-labelledby="portal-footer-brand">
          <div class="flex items-start gap-3.5">
            <institutional-logo class="size-12 rounded-full bg-primary" />

            <div class="min-w-0">
              <h2
                id="portal-footer-brand"
                class="text-base leading-snug font-bold"
              >
                Gobierno Autónomo Municipal de Sacaba
              </h2>
              <p class="mt-1 text-sm text-muted-foreground">
                Intranet institucional
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="portal-footer-contact">
          <h2
            id="portal-footer-contact"
            class="text-sm font-semibold tracking-wide uppercase"
          >
            Contacto
          </h2>
          <ul class="mt-3 grid gap-2 text-sm text-muted-foreground">
            <li class="flex items-start gap-2">
              <ng-icon
                name="lucideMapPin"
                class="mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <span>Plaza 6 de Agosto, Sacaba, Bolivia</span>
            </li>
            <li>
              <a
                href="tel:+59144701677"
                class="inline-flex items-center gap-2 underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                <ng-icon name="lucidePhone" aria-hidden="true" />
                <span>
                  <span class="font-medium">Línea directa:</span>
                  +(591) 4-4701677
                </span>
              </a>
            </li>
            <li>
              <a
                href="mailto:info@sacaba.gob.bo"
                class="inline-flex items-center gap-2 underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                <ng-icon name="lucideMail" aria-hidden="true" />
                <span class="wrap-anywhere">
                  <span class="font-medium">Correo institucional:</span>
                  info@sacaba.gob.bo
                </span>
              </a>
            </li>
            <li>
              <a
                href="mailto:gobiernoelectronico@sacaba.gob.bo"
                class="inline-flex items-center gap-2 underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                <ng-icon name="lucideMail" aria-hidden="true" />
                <span class="wrap-anywhere">
                  <span class="font-medium">Sugerencias:</span>
                  gobiernoelectronico@sacaba.gob.bo
                </span>
              </a>
            </li>
          </ul>
        </section>

        <section aria-labelledby="portal-footer-channels">
          <h2
            id="portal-footer-channels"
            class="text-sm font-semibold tracking-wide uppercase"
          >
            Canales oficiales
          </h2>
          <a
            href="https://sacaba.gob.bo/"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            <ng-icon name="lucideGlobe" aria-hidden="true" />
            Sitio web institucional
          </a>

          <div
            class="mt-3 flex items-center gap-1.5"
            role="group"
            aria-label="Redes sociales oficiales"
          >
            @for (channel of officialChannels; track channel.href) {
              <a
                hlmBtn
                variant="ghost"
                size="icon-lg"
                [href]="channel.href"
                target="_blank"
                rel="noopener noreferrer"
                class="text-muted-foreground"
                [attr.aria-label]="channel.label"
              >
                <ng-icon [name]="channel.icon" />
              </a>
            }
          </div>
        </section>
      </div>

      <div class="border-t border-sidebar-border">
        <div
          class="mx-auto flex w-full max-w-7xl flex-col gap-1 px-5 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8"
        >
          <p>© {{ currentYear }} Gobierno Autónomo Municipal de Sacaba.</p>
          <p>Intranet institucional</p>
        </div>
      </div>
    </footer>
  `,
  styles: `
    .portal-footer {
      --sidebar: color-mix(in oklch, var(--landing-forest) 78%, black);
      --sidebar-foreground: var(--color-white);
      --sidebar-border: color-mix(
        in srgb,
        var(--color-white) 13%,
        transparent
      );
      --foreground: var(--color-white);
      --muted-foreground: color-mix(
        in srgb,
        var(--color-white) 68%,
        transparent
      );
      --primary: var(--landing-emerald);
      --primary-foreground: var(--landing-forest);
      --accent: color-mix(in srgb, var(--color-white) 10%, transparent);
      --accent-foreground: var(--color-white);
      --ring: color-mix(in srgb, var(--color-white) 82%, transparent);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortalFooter {
  readonly currentYear = new Date().getFullYear();

  readonly officialChannels: readonly OfficialChannel[] = [
    {
      label: 'Facebook del Gobierno Autónomo Municipal de Sacaba',
      href: 'https://www.facebook.com/gob.municipal.sacaba',
      icon: 'lucideFacebook',
    },
    {
      label: 'Instagram del Gobierno Autónomo Municipal de Sacaba',
      href: 'https://www.instagram.com/gamsacaba',
      icon: 'lucideInstagram',
    },
    {
      label: 'TikTok del Gobierno Autónomo Municipal de Sacaba',
      href: 'https://www.tiktok.com/@gamsacaba',
      icon: 'lucideMusic2',
    },
  ];
}
