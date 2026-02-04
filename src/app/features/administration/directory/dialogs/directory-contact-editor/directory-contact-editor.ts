import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FormUtils } from '../../../../../helpers';

@Component({
  selector: 'app-directory-contact-editor',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FloatLabelModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    CheckboxModule,
    MessageModule,
    ButtonModule,
  ],
  templateUrl: './directory-contact-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DirectoryContactEditor implements OnInit {
  private formBuilder = inject(FormBuilder);
  private diagloRef = inject(DynamicDialogRef);

  form: FormGroup = this.formBuilder.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    internalPhone: [''],
    externalPhone: [''],
    order: [0, [Validators.required, Validators.min(0)]],
    isActive: [true, Validators.required],
    sectionId: ['', Validators.required],
  });

  readonly formUtils = FormUtils;

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.form.valid) {
      console.log(this.form.value);
      // Aquí se enviará el formulario al servicio
    }
  }

  close() {
    this.diagloRef.close();
  }
}
