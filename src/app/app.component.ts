import { AfterViewInit, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, ValidationErrors, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  @ViewChild('hoverTooltip') hoverTooltip?: ElementRef;
  @ViewChild('errorTrigger') errorTrigger?: ElementRef;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit() {
    // Set up manual event listeners if the Angular bindings aren't working
    if (this.errorTrigger && this.hoverTooltip) {
      const triggerEl = this.errorTrigger.nativeElement;
      const tooltipEl = this.hoverTooltip.nativeElement;

      triggerEl.addEventListener('mouseenter', () => {
        console.log('Direct mouseenter event triggered');
        this.showTooltip();
      });

      triggerEl.addEventListener('mouseleave', () => {
        console.log('Direct mouseleave event triggered');
        this.hideTooltip();
      });
    }
  }

  FORM_ERRORS: any = {
    differentFromOriginal: 'Different from original value',
    required: 'This field is required',
    minlength: 'Must be at least 8 characters',
    maxlength: 'Cannot exceed 20 characters',
    email: 'Must be a valid email format',
    min: 'Value must be at least 5',
    max: 'Value cannot exceed 100',
    startsWithInvalid: 'Cannot start with a special character',
    hasUppercase: 'Must contain at least one uppercase letter'
  }
  listErrors: any = [
    'differentFromOriginal',
    'required',
    'minlength',
    'maxlength',
    'email',
    'min',
    'max',
    'startsWithInvalid',
    'hasUppercase'
  ];

  // Original value for differentFromOriginal validation
  originalValue = 'Initial123Value';

  // Custom validator: starts with invalid character
  startsWithInvalidValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    if (/^[!@#$%^&*]/.test(value)) {
      return { startsWithInvalid: true };
    }
    return null;
  }

  // Custom validator: must have uppercase
  hasUppercaseValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    if (!/[A-Z]/.test(value)) {
      return { hasUppercase: true };
    }
    return null;
  }

  control = {
    label: 'Form Input',
    placeholder: 'Enter value',
    formControl: new FormControl(this.originalValue, [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(20),
      Validators.email,
      this.startsWithInvalidValidator.bind(this),
      this.hasUppercaseValidator.bind(this)
    ]),
    readonly: false,
    onChange: (_: Event) => {}
  }
  inputTypes = {
    Text: 'text',
    Number: 'number',
    Email: 'email',
    Password: 'password',
    Tel: 'tel',
  }

  // Property to control error popup visibility
  showErrorPopup = false;

  // Property to control hover tooltip visibility
  showErrorsOnHover = false;

  isOnlyDifferentFromOriginal(control: FormControl) {
    return control.value !== this.originalValue;
  }

  errorKeys(errors: any) {
    return Object.keys(errors);
  }

  /**
   * Get the actual error keys from the form control
   * @returns Array of active error keys
   */
  getActiveErrorKeys(): string[] {
    if (!this.control.formControl.errors) {
      return [];
    }

    // Get actual errors from the form control
    const activeErrors = Object.keys(this.control.formControl.errors);

    // Add differentFromOriginal error if applicable
    if (this.isOnlyDifferentFromOriginal(this.control.formControl) &&
        !activeErrors.includes('differentFromOriginal')) {
      activeErrors.push('differentFromOriginal');
    }

    return activeErrors;
  }

  /**
   * Demo method to trigger different validation errors
   * @param type The type of validation to trigger
   */
  triggerValidation(type: 'empty' | 'short' | 'long' | 'pattern' | 'all' | 'valid'): void {
    switch(type) {
      case 'empty':
        this.control.formControl.setValue('');
        break;
      case 'short':
        this.control.formControl.setValue('b@a.co');
        break;
      case 'long':
        this.control.formControl.setValue('fnawfasfsaf@fas.gffaw');
        break;
      case 'pattern':
        this.control.formControl.setValue('abc-123-!@#');
        break;
      case 'all':
        // This will trigger multiple errors (at least 5):
        // 1. minlength (too short)
        // 2. pattern (has special characters)
        // 3. email (not a valid email format)
        // 4. differentFromOriginal (different from the original value)
        // 5. startsWithInvalid (starts with special character)
        // 6. hasUppercase (no uppercase letter)
        this.control.formControl.setValue('@example');
        break;
      case 'valid':
        this.control.formControl.setValue('Vali123@af.com');
        break;
    }

    // Mark the control as touched to trigger validation
    this.control.formControl.markAsTouched();
    this.control.formControl.updateValueAndValidity();
  }

  /**
   * Toggle the error popup visibility
   * @param event Optional mouse event for stopping propagation
   */
  toggleErrorPopup(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.showErrorPopup = !this.showErrorPopup;
  }

  /**
   * Close popup when clicking outside
   */
  closeErrorPopup() {
    this.showErrorPopup = false;
  }

  /**
   * Show the error tooltip on hover
   */
  showTooltip() {
    console.log('Mouse enter - setting showErrorsOnHover to true');
    this.showErrorsOnHover = true;

    if (this.hoverTooltip) {
      this.renderer.addClass(this.hoverTooltip.nativeElement, 'show-tooltip');
      this.renderer.setStyle(this.hoverTooltip.nativeElement, 'display', 'block');
      this.renderer.setStyle(this.hoverTooltip.nativeElement, 'opacity', '1');
      this.renderer.setStyle(this.hoverTooltip.nativeElement, 'transform', 'translateY(0)');
    }
  }

  /**
   * Hide the error tooltip when mouse leaves
   */
  hideTooltip() {
    console.log('Mouse leave - setting showErrorsOnHover to false');
    this.showErrorsOnHover = false;

    if (this.hoverTooltip) {
      this.renderer.removeClass(this.hoverTooltip.nativeElement, 'show-tooltip');
      this.renderer.setStyle(this.hoverTooltip.nativeElement, 'display', 'none');
    }
  }

  /**
   * Directly toggle tooltip visibility for testing
   */
  toggleTooltipVisibility() {
    this.showErrorsOnHover = !this.showErrorsOnHover;

    if (this.hoverTooltip) {
      if (this.showErrorsOnHover) {
        console.log('Forcing tooltip to show');
        this.renderer.addClass(this.hoverTooltip.nativeElement, 'show-tooltip');
        this.renderer.setStyle(this.hoverTooltip.nativeElement, 'display', 'block');
      } else {
        console.log('Forcing tooltip to hide');
        this.renderer.removeClass(this.hoverTooltip.nativeElement, 'show-tooltip');
        this.renderer.setStyle(this.hoverTooltip.nativeElement, 'display', 'none');
      }
    }
  }

  /**
   * Force the tooltip to show for testing
   */
  forceShowTooltip() {
    if (this.hoverTooltip) {
      alert('Forcing tooltip to show');
      this.renderer.setStyle(this.hoverTooltip.nativeElement, 'display', 'block !important');
      this.renderer.setStyle(this.hoverTooltip.nativeElement, 'visibility', 'visible !important');
      this.renderer.setStyle(this.hoverTooltip.nativeElement, 'opacity', '1 !important');
      this.showErrorsOnHover = true;
    }
  }
}
