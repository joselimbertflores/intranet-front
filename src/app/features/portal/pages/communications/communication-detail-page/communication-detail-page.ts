import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { rxResource } from '@angular/core/rxjs-interop';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';

import { ScrollStateService, FileSizePipe } from '../../../../../shared';
import { PortalCommunicationDataSource } from '../../../services';

@Component({
  selector: 'app-communication-detail-page',
  imports: [
    CommonModule,
    ButtonModule,
    SkeletonModule,
    ProgressSpinnerModule,
    FileSizePipe,
  ],
  templateUrl: './communication-detail-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CommunicationDetailPage {
  private router = inject(Router);
  private location = inject(Location);
  private scrollService = inject(ScrollStateService);
  private portalService = inject(PortalCommunicationDataSource);

  id = input.required<string>();

  resource = rxResource({
    params: () => ({ id: this.id() }),
    stream: ({ params }) => this.portalService.getDetail(params.id),
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
    if (!this.resource.value()) return;
    // const { fileUrl, originalName } = this.resource.value();
    // this.portalService.download(fileUrl, originalName);
  }
}
