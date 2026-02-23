import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';

import { rxResource } from '@angular/core/rxjs-interop';

import { RouterLink } from "@angular/router";

import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';

import { PortalTutorialDataSource } from '../../services';

@Component({
  selector: 'app-tutorials-list',
  imports: [InputTextModule, PaginatorModule, RouterLink],
  templateUrl: './tutorials-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TutorialsList {
  private potalTutorialData = inject(PortalTutorialDataSource);

  private resource = rxResource({
    stream: () => this.potalTutorialData.getTutorials(),
    defaultValue: { tutorials: [], total: 0 },
  });

  dataSource = computed(() => this.resource.value().tutorials);
}
