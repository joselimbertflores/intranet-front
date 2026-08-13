import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnDestroy,
  PLATFORM_ID,
  viewChild,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMapPinOff } from '@ng-icons/lucide';

import { PortalDirectorySiteResponse } from '../../../../interfaces';

type DirectoryLocation = PortalDirectorySiteResponse & {
  latitude: number;
  longitude: number;
};

@Component({
  selector: 'app-directory-map',
  imports: [NgIcon],
  providers: [provideIcons({ lucideMapPinOff })],
  templateUrl: './directory-map.html',
})
export class DirectoryMap implements AfterViewInit, OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly mapElement = viewChild<ElementRef<HTMLDivElement>>('map');

  readonly sites = input.required<readonly PortalDirectorySiteResponse[]>();
  readonly locations = computed<DirectoryLocation[]>(() =>
    this.sites().filter(
      (site): site is DirectoryLocation =>
        typeof site.latitude === 'number' &&
        Number.isFinite(site.latitude) &&
        site.latitude >= -90 &&
        site.latitude <= 90 &&
        typeof site.longitude === 'number' &&
        Number.isFinite(site.longitude) &&
        site.longitude >= -180 &&
        site.longitude <= 180,
    ),
  );

  private map: import('leaflet').Map | null = null;
  private destroyed = false;

  async ngAfterViewInit(): Promise<void> {
    const mapElement = this.mapElement()?.nativeElement;
    if (!isPlatformBrowser(this.platformId) || !mapElement || !this.locations().length) return;

    const leaflet = await import('leaflet');
    if (this.destroyed) return;

    leaflet.Icon.Default.imagePath = '';
    leaflet.Icon.Default.mergeOptions({
      iconUrl: '/assets/leaflet/marker-icon.png',
      iconRetinaUrl: '/assets/leaflet/marker-icon-2x.png',
      shadowUrl: '/assets/leaflet/marker-shadow.png',
    });

    this.map = leaflet.map(mapElement, { scrollWheelZoom: false });
    leaflet
      .tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      })
      .addTo(this.map);

    const markers = this.locations().map((site) =>
      leaflet
        .marker([site.latitude, site.longitude])
        .bindPopup(this.createPopup(site))
        .addTo(this.map!),
    );
    const bounds = leaflet.featureGroup(markers).getBounds();
    this.map.fitBounds(bounds, { maxZoom: 16, padding: [36, 36] });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.map?.remove();
  }

  private createPopup(site: DirectoryLocation): HTMLElement {
    const content = this.document.createElement('div');
    content.className = 'flex min-w-40 flex-col gap-2';

    const name = this.document.createElement('strong');
    name.textContent = site.name;
    content.append(name);

    const directions = this.document.createElement('a');
    directions.href = `https://www.google.com/maps/dir/?api=1&destination=${site.latitude},${site.longitude}`;
    directions.target = '_blank';
    directions.rel = 'noopener noreferrer';
    directions.className = 'font-medium text-primary underline-offset-4 hover:underline';
    directions.textContent = 'Cómo llegar';
    content.append(directions);

    return content;
  }
}
