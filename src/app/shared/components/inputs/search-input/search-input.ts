import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs';

@Component({
  selector: 'search-input',
  imports: [

    ReactiveFormsModule,
  ],
  template: `
    <!-- <app-ui-floatlabel iconPosition="left" class="ml-auto" variant="on">
      <app-ui-iconfield>
        <app-ui-inputicon class="ui-icon ui-icon-search" />
        <input
          appUiInput
          type="text"
          [formControl]="searchControl"
          class="w-full"
        />
      </app-ui-iconfield>
      <label>{{ label() }}</label>
    </app-ui-floatlabel> -->
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchInput implements OnInit {
  private destroyRef = inject(DestroyRef);

  value = input<string | null>(null);
  label = input<string>('Buscar');
  searchControl = new FormControl('');
  search = output<string>();

  constructor() {
    effect(() => {
      this.searchControl.setValue(this.value(), { emitEvent: false });
    });
  }

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(450),
        takeUntilDestroyed(this.destroyRef),
        distinctUntilChanged(),
        filter((term) => term !== null),
      )
      .subscribe((term) => {
        this.search.emit(term);
      });
  }
}
