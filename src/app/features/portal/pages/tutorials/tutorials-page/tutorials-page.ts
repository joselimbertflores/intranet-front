import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';

import { rxResource } from '@angular/core/rxjs-interop';

import { RouterModule } from '@angular/router';

import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';

import { PortalTutorialDataSource } from '../../../services';
import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tutorials-page',
  imports: [CommonModule,InputTextModule, PaginatorModule, RouterModule, TagModule],
  templateUrl: './tutorials-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TutorialsPage implements OnInit {
  private potalTutorialData = inject(PortalTutorialDataSource);

  dataSource = signal<any[]>([]);
  dataSize = signal(0);
  isLoading = signal(false);
  // private resource = rxResource({
  //   stream: () => this.potalTutorialData.getTutorials(),
  //   defaultValue: { tutorials: [], total: 0 },
  // });

  // dataSource = computed(() => this.resource.value().tutorials);

  ngOnInit(): void {
    this.fetchMore();
  }

  fetchMore(): void {
    if (this.isLoading()) return;
    this.isLoading.set(true);
    this.potalTutorialData.getData().subscribe(({ tutorials, total }) => {
      this.dataSource.update((v) => [...v, ...tutorials]);
      this.dataSize.set(total);
      this.isLoading.set(false);
    });
  }
}
