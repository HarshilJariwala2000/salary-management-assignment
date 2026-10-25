/**
 * Errors the logic layer raises. The transport maps each kind to a tRPC code and
 * passes `field` to the client, so the form can show the message on the right input.
 */
export abstract class DomainError extends Error {
  abstract readonly kind: 'NOT_FOUND' | 'INVALID_FIELD' | 'CONFLICT';
  readonly field?: string;
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
