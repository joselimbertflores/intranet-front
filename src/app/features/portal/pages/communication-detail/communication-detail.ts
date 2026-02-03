import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';

import { PortalCommunicationService } from '../../services';
import { PdfDisplayComponent, ScrollStateService } from '../../../../shared';

@Component({
  selector: 'app-communication-detail',
  imports: [CommonModule, ButtonModule, SkeletonModule, PdfDisplayComponent],
  templateUrl: './communication-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CommunicationDetail {
  private router = inject(Router);
  private location = inject(Location);
  private scrollService = inject(ScrollStateService);
  private portalService = inject(PortalCommunicationService);

  id = input.required<string>();

  communicationResource = rxResource({
    params: () => ({ id: this.id() }),
    stream: ({ params }) => this.portalService.getOne(params.id),
  });

  goBack() {
    this.scrollService.keepScroll();
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/communications']);
    }
  }

  download() {
    if (!this.communicationResource.value()) return;
    const { fileUrl, originalName } = this.communicationResource.value();
    this.portalService.download(fileUrl, originalName);
  }
}
