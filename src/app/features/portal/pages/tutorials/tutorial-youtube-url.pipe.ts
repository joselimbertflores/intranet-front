import { inject, Pipe, type PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

const YOUTUBE_EMBED_URL =
  /^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]{11}$/;

@Pipe({ name: 'tutorialYoutubeUrl' })
export class TutorialYoutubeUrlPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(value: string | null): SafeResourceUrl | null {
    if (!value || !YOUTUBE_EMBED_URL.test(value)) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(value);
  }
}
