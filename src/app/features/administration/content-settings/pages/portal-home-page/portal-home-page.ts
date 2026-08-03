import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideGalleryHorizontal,
  lucideMousePointerClick,
  lucideImages,
} from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';

import { AuthDataSource } from '../../../../../core/auth/auth-data-source';
import {
  PermissionAction,
  Resource,
} from '../../../../../core/auth/auth.types';
import { HeroSlideEditor, FeaturedBannerEditor } from '../../dialogs';

@Component({
  selector: 'app-portal-home-page',
  imports: [NgIcon, HlmButton, RouterLink],
  providers: [
    provideIcons({
      lucideGalleryHorizontal,
      lucideImages,
      lucideMousePointerClick,
    }),
  ],
  templateUrl: './portal-home-page.html',
})
export default class PortalHomePage {
  private readonly authDataSource = inject(AuthDataSource);
  private readonly dialogService = inject(HlmDialogService);

  readonly canUpdate = computed(() =>
    this.authDataSource.can(Resource.CONTENT, PermissionAction.UPDATE),
  );

  showHeroSectionDialog(): void {
    this.dialogService.open(HeroSlideEditor, {
      showCloseButton: false,
      contentClass: 'w-[calc(100vw-2rem)] sm:!max-w-[1200px]',
    });
  }

  showFeaturedBannersDialog(): void {
    this.dialogService.open(FeaturedBannerEditor, {
      showCloseButton: false,
      contentClass: 'w-[calc(100vw-2rem)] sm:!max-w-[1200px]',
    });
  }
}
