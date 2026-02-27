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

import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';

import { FileSizePipe } from '../../../../../shared';
import { PortalCommunicationDataSource } from '../../../services';

@Component({
  selector: 'app-communication-detail-page',
  imports: [
    CommonModule,
    ButtonModule,
    SkeletonModule,
    FileSizePipe,
    ProgressSpinnerModule,
  ],
  templateUrl: './communication-detail-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CommunicationDetailPage {
  private location = inject(Location);
  private portalService = inject(PortalCommunicationDataSource);

  id = input.required<string>();

  resource = rxResource({
    params: () => ({ id: this.id() }),
    stream: ({ params }) => this.portalService.getDetail(params.id),
  });

  goBack() {
    this.location.back();
  }
}
