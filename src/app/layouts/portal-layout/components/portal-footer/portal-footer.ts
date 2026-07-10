import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import { InstitutionalLogo } from '../../../../shared/components/institutional-logo/institutional-logo';

interface ContactItem {
  label: string;
  value: string;
  icon: string;
  href?: string;
  detail?: string;
}

interface OfficialChannel {
  label: string;
  icon: string;
  href: string;
}

@Component({
  selector: 'portal-footer',
  imports: [InstitutionalLogo, NgTemplateOutlet],
  template: `
    <footer
      class="border-t border-white/10 bg-linear-to-br from-primary-950 via-primary-900 to-primary-800 text-primary-50"
    >
      <div
        class="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1.15fr_1fr_0.75fr] lg:gap-8 lg:px-8 lg:py-7"
      >
        <section class="min-w-0" aria-labelledby="portal-footer-brand">
          <div class="flex items-start gap-3.5">
            <institutional-logo />

            <div class="min-w-0 pt-0.5">
              <h2
                id="portal-footer-brand"
                class="text-base font-bold leading-snug tracking-tight text-white"
              >
                Gobierno Autónomo Municipal de Sacaba
              </h2>
              <p class="mt-1 text-sm font-semibold text-primary-100">
                Intranet institucional
              </p>
            </div>
          </div>

          <p class="mt-3 max-w-md text-sm leading-6 text-primary-100/80">
            Espacio interno de consulta, comunicación y acceso a recursos
            institucionales.
          </p>
        </section>

        <section aria-labelledby="portal-footer-contact">
          <h2
            id="portal-footer-contact"
            class="text-xs font-bold tracking-[0.14em] text-primary-100 uppercase"
          >
            Contacto institucional
          </h2>

          <div class="mt-3 grid gap-2.5">
            @for (item of contactItems; track item.label) {
              @if (item.href) {
                <a
                  [href]="item.href"
                  class="group flex min-h-10 items-start gap-3 rounded-lg text-primary-50 no-underline outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-primary-200 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-950"
                >
                  <ng-container
                    [ngTemplateOutlet]="contactItemContent"
                    [ngTemplateOutletContext]="{ $implicit: item }"
                  />
                </a>
              } @else {
                <div class="flex min-h-10 items-start gap-3 text-primary-50">
                  <ng-container
                    [ngTemplateOutlet]="contactItemContent"
                    [ngTemplateOutletContext]="{ $implicit: item }"
                  />
                </div>
              }
            }
          </div>
        </section>

        <section aria-labelledby="portal-footer-channels">
          <h2
            id="portal-footer-channels"
            class="text-xs font-bold tracking-[0.14em] text-primary-100 uppercase"
          >
            Canales oficiales
          </h2>

          <div class="mt-3 flex flex-wrap gap-2 lg:flex-col">
            @for (channel of officialChannels; track channel.label) {
              <a
                [href]="channel.href"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 text-sm font-semibold text-primary-50 no-underline outline-none transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-primary-200 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-950 lg:w-fit"
              >
                <i [class]="channel.icon + ' text-sm'" aria-hidden="true"></i>
                <span>{{ channel.label }}</span>
              </a>
            }
          </div>
        </section>
      </div>

      <div class="border-t border-white/10">
        <div
          class="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-3.5 text-xs text-primary-100/70 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"
        >
          <p>
            © {{ currentYear }} Gobierno Autónomo Municipal de Sacaba. Todos los
            derechos reservados.
          </p>
          <p class="font-medium text-primary-100/80">Intranet institucional</p>
        </div>
      </div>

      <ng-template #contactItemContent let-item>
        <span
          class="grid size-8 shrink-0 place-items-center rounded-full bg-white/8 text-primary-100 transition-colors group-hover:bg-white/12"
        >
          <i [class]="item.icon + ' text-sm'" aria-hidden="true"></i>
        </span>

        <span class="min-w-0">
          <span class="block text-xs font-medium text-primary-100/70">
            {{ item.label }}
          </span>
          <span class="block text-sm font-semibold leading-5 text-inherit">
            {{ item.value }}
          </span>
          @if (item.detail) {
            <span class="mt-0.5 block text-xs leading-5 text-primary-100/65">
              {{ item.detail }}
            </span>
          }
        </span>
      </ng-template>
    </footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortalFooter {
  readonly currentYear: number = new Date().getFullYear();

  readonly contactItems: readonly ContactItem[] = [
    {
      label: 'Dirección',
      value: 'Plaza Principal 6 de Agosto',
      detail: 'Sacaba, Cochabamba',
      icon: 'pi pi-map-marker',
    },
    {
      label: 'Línea directa',
      value: 'Atención institucional',
      icon: 'pi pi-phone',
    },
    {
      label: 'Correo institucional',
      value: 'contacto@sacaba.gob.bo',
      href: 'mailto:contacto@sacaba.gob.bo',
      icon: 'pi pi-envelope',
    },
    {
      label: 'Sugerencias',
      value: 'Enviar sugerencia',
      href: 'mailto:sugerencias@sacaba.gob.bo',
      icon: 'pi pi-lightbulb',
    },
  ];

  readonly officialChannels: readonly OfficialChannel[] = [
    {
      label: 'Sitio web institucional',
      href: 'https://www.sacaba.gob.bo/',
      icon: 'pi pi-globe',
    },
    {
      label: 'Facebook',
      href: 'https://www.facebook.com/gamsacaba',
      icon: 'pi pi-facebook',
    },
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/gamsacaba',
      icon: 'pi pi-instagram',
    },
    {
      label: 'TikTok',
      href: 'https://www.tiktok.com/@gamsacaba',
      icon: 'pi pi-tiktok',
    },
  ];
}
