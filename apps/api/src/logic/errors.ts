/**
 * Errors the logic layer raises. The transport maps each kind to a tRPC code and
 * passes `field` to the client, so the form can show the message on the right input.
 */
export abstract class DomainError extends Error {
  abstract readonly kind: 'NOT_FOUND' | 'INVALID_FIELD' | 'CONFLICT';
  readonly field?: string;
}

export class NotFound extends DomainError {
  readonly kind = 'NOT_FOUND';
  constructor(readonly entity: 'employee' | 'country' | 'payGroup') {
    super(`${entity === 'payGroup' ? 'Pay group' : entity[0]!.toUpperCase() + entity.slice(1)} not found`);
    this.name = 'NotFound';
  }
}

export type EmployeeField = 'fullName' | 'email' | 'countryId' | 'roleId' | 'joiningDate' | 'annualCtc';

export class InvalidField extends DomainError {
  readonly kind = 'INVALID_FIELD';
  constructor(
    readonly field: EmployeeField,
    readonly reason: 'unknown' | 'future',
    message: string,
  ) {
    super(message);
    this.name = 'InvalidField';
  }
}

export class DuplicateEmail extends DomainError {
  readonly kind = 'CONFLICT';
  readonly field = 'email';
  constructor() {
    super('Another employee already has this email');
    this.name = 'DuplicateEmail';
  }
}
