import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CommunicationCard } from '../../../components';
import { PortalCommunicationDataSource } from '../../../services';

@Component({
  selector: 'app-communications-page',
  imports: [CommunicationCard],
  templateUrl: './communications-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CommunicationsPage {
  private comunicationDataSOuyrce = inject(PortalCommunicationDataSource);

  limit = signal(10);
  offset = signal(0);
  searchTerm = signal('');

  resource = rxResource({
    params: () => ({
      offset: this.offset(),
      limit: this.limit(),
      term: this.searchTerm(),
    }),
    stream: ({ params }) =>
      this.comunicationDataSOuyrce.findAll({
        limit: params.limit,
        offset: params.offset,
      }),
  });

  
}
