import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
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
  BannerEditor,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PortalHomePage {
  private readonly authDataSource = inject(AuthDataSource);
  private readonly dialogService = inject(HlmDialogService);

  readonly canUpdate = computed(() =>
    this.authDataSource.can(Resource.CONTENT, PermissionAction.UPDATE),
  );

  showHeroSectionDialog(): void {
    this.dialogService.open(BannerEditor, {
      showCloseButton: false,
      // contentClass: 'sm:!w-[500px] sm:!max-w-[calc(100vw-8rem)]',
    });
  }

  showFeaturedBannersDialog(): void {
    this.dialogService.open(FeaturedBannerEditor, {
      contentClass: 'max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-6xl',
    });
  }

  showQuickAccessDialog(): void {
    this.dialogService.open(QuickAccessEditor, {
      contentClass: 'max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-4xl',
    });
  }
}
