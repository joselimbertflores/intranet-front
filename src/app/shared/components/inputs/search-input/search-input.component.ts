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

import { FloatLabelModule } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'search-input',
  imports: [
    IconFieldModule,
    InputTextModule,
    InputIconModule,
    ReactiveFormsModule,
    FloatLabelModule,
  ],
  template: `
    <p-floatlabel iconPosition="left" class="ml-auto" variant="on">
      <p-iconfield>
        <p-inputicon class="pi pi-search" />
        <input
          pInputText
          type="text"
          [formControl]="searchControl"
          class="w-full"
        />
      </p-iconfield>
      <label>{{ label() }}</label>
    </p-floatlabel>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchInputComponent implements OnInit {
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
        console.log('EMITIENDO EVENTO', term);
        this.search.emit(term);
      });
  }
}
