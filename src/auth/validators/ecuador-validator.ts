import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsEcuadorianIdConstraint implements ValidatorConstraintInterface {
  validate(value: any) {
    if (typeof value !== 'string') return false;
    const id = value.trim();
    if (!/^[0-9]+$/.test(id)) return false;
    if (id.length === 10) {
      const province = parseInt(id.substring(0, 2), 10);
      if (province < 1 || province > 24) return false;
      const third = parseInt(id.charAt(2), 10);
      if (third >= 6) return false;
      const coefficients = [2,1,2,1,2,1,2,1,2];
      let total = 0;
      for (let i = 0; i < coefficients.length; i++) {
        let val = parseInt(id.charAt(i), 10) * coefficients[i];
        if (val >= 10) val -= 9;
        total += val;
      }
      const checkDigit = parseInt(id.charAt(9), 10);
      const decena = Math.ceil(total / 10) * 10;
      const calc = decena - total;
      return calc === checkDigit || (total % 10 === 0 && checkDigit === 0);
    }
    if (id.length === 13) {
      const first10 = id.substring(0,10);
      const suffix = id.substring(10);
      // basic: first 10 must be valid id and suffix > 0
      if (!this.validate(first10)) return false;
      return parseInt(suffix, 10) > 0;
    }
    return false;
  }
}

export function IsEcuadorianId(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEcuadorianIdConstraint,
    });
  };
}

@ValidatorConstraint({ async: false })
export class IsAlphaSpaceConstraint implements ValidatorConstraintInterface {
  validate(value: any) {
    if (typeof value !== 'string') return false;
    return /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(value.trim());
  }
}

export function IsAlphaSpace(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsAlphaSpaceConstraint,
    });
  };
}

@ValidatorConstraint({ async: false })
export class IsEcuadorPhoneConstraint implements ValidatorConstraintInterface {
  validate(value: any) {
    if (typeof value !== 'string') return false;
    return /^09[0-9]{8}$/.test(value.trim());
  }
}

export function IsEcuadorPhone(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEcuadorPhoneConstraint,
    });
  };
}
