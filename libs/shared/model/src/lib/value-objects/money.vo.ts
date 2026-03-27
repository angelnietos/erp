/**
 * Money Value Object - represents a monetary value with currency.
 */
export class Money {
  readonly amount: number;
  readonly currency: string;

  private constructor(amount: number, currency: string) {
    this.amount = Math.round(amount * 100) / 100; // Round to 2 decimal places
    this.currency = currency.toUpperCase();
  }

  static create(amount: number, currency = 'EUR'): Money {
    if (amount < 0) {
      throw new Error('Money amount cannot be negative');
    }
    return new Money(amount, currency);
  }

  static zero(currency = 'EUR'): Money {
    return new Money(0, currency);
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add money with different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot subtract money with different currencies');
    }
    const result = this.amount - other.amount;
    if (result < 0) {
      throw new Error('Money amount cannot be negative');
    }
    return new Money(result, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  toString(): string {
    return `${this.amount.toFixed(2)} ${this.currency}`;
  }
}
