import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

import { PortalCommunicationDataSource } from '../../services';
import { SearchInput } from '../../../../shared';
@Component({
  selector: 'app-communications',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    SelectModule,
    ProgressBarModule,
    SearchInput,
  ],
  templateUrl: './communications.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CommunicationsComponent {
  private portalCommunucationService = inject(PortalCommunicationDataSource);
  limit = signal(10);
  index = signal(0);
  offset = computed(() => this.limit() * this.index());
  term = signal<string>('');
  typeId = signal<number | null>(null);

  types = computed(() => [
    { id: null, name: 'TODO' },
    ...this.portalCommunucationService.types(),
  ]);

  readonly communicationResource = rxResource({
    params: () => ({
      term: this.term(),
      limit: this.limit(),
      offset: this.offset(),
      typeId: this.typeId(),
    }),
    stream: ({ params }) => this.portalCommunucationService.findAll(params),
  });

  download(item: any) {
    this.portalCommunucationService.download(item.fileUrl, item.originalName);
  }
}
