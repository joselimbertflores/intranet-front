import { Component, computed, inject } from '@angular/core';
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
import {
  HeroSlideEditor,
  FeaturedBannerEditor,
  QuickAccessEditor,
} from '../../dialogs';

@Component({
  selector: 'app-portal-home-page',
  imports: [NgIcon, HlmButton],
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
      contentClass: 'sm:w-[90vw] sm:max-w-[1200px]',
    });
  }

  showFeaturedBannersDialog(): void {
    this.dialogService.open(FeaturedBannerEditor, {
      showCloseButton: false,
      contentClass: 'sm:w-[90vw] sm:max-w-[1200px]',
    });
  }

  showQuickAccessDialog(): void {
    this.dialogService.open(QuickAccessEditor, {
      showCloseButton: false,
      contentClass: 'sm:w-[90vw] sm:max-w-[800px]',
    });
  }
}
