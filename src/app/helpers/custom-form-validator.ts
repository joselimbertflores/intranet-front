import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomFormValidators {
  static notOnlyWhitespace(control: AbstractControl) {
    const value = control.value as string;
    if (value && value.trim().length === 0) {
      return { whitespace: true };
    }
    return null;
  }

  static noWhitespace(control: AbstractControl): ValidationErrors | null {
    const isWhitespace = (control.value || '').trim().length === 0;
    return !isWhitespace ? null : { whitespace: true };
  }

  static minLengthArray(minLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return control.value.length < minLength
        ? { arrayMinLength: { requiredLength: minLength } }
        : null;
    };
  }
}
