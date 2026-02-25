import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { map } from 'rxjs';

import { ButtonModule } from 'primeng/button';

import { PortalTutorialDataSource } from '../../services';
import { WindowScrollStore } from '../../../../shared';
@Component({
  selector: 'app-tutorials-detail',
  imports: [CommonModule, ButtonModule],
  templateUrl: './tutorials-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TutorialsDetail {
  private router = inject(Router);
  private location = inject(Location);
  private route = inject(ActivatedRoute);
  private scrollService = inject(WindowScrollStore);
  private portalTutorialService = inject(PortalTutorialDataSource);

  slug = input.required<string>();

  videoId = toSignal(
    this.route.queryParamMap.pipe(map((param) => param.get('video') ?? null)),
  );

  dataResource = rxResource({
    params: () => ({ id: this.slug() }),
    stream: ({ params }) => this.portalTutorialService.findBySlug(params.id),
  });

  // currentVideo = computed(() => {
  //   if (!this.videoId()) return null;
  //   const videos = this.dataResource.value()?.videos ?? [];
  //   return videos.find(({ id }) => id.toString() === this.videoId());
  // });

  selectVideo(video: any) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { video: video.id },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  goBack() {
    // this.scrollService.keepScroll();
    // if (window.history.length > 1) {
    //   this.location.back();
    // } else {
    //   this.router.navigate(['/communications']);
    // }
  }
}
