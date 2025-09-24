export class User {
  constructor(
    public readonly id: string,
    public readonly personalIdentifier: string, // DNI, NIE, Passport, etc.
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly phone: string,
    public readonly address: string,
    public readonly city: string,
    public readonly postalCode: string,
    public readonly country: string,
    public readonly dateOfBirth: Date,
    public readonly active: boolean = true,
    public readonly membershipType: string = 'standard', // standard, premium, vip
    public readonly registrationDate: Date = new Date(),
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {
    this.validateUser();
  }

  private validateUser(): void {
    if (!this.personalIdentifier || this.personalIdentifier.trim().length === 0) {
      throw new Error('Personal identifier is required');
    }

    if (!this.firstName || this.firstName.trim().length === 0) {
      throw new Error('First name is required');
    }

    if (!this.lastName || this.lastName.trim().length === 0) {
      throw new Error('Last name is required');
    }

    if (!this.email || this.email.trim().length === 0) {
      throw new Error('Email is required');
    }

    if (!this.isValidEmail(this.email)) {
      throw new Error('Invalid email format');
    }

    if (!this.phone || this.phone.trim().length === 0) {
      throw new Error('Phone number is required');
    }

    if (!this.address || this.address.trim().length === 0) {
      throw new Error('Address is required');
    }

    if (!this.city || this.city.trim().length === 0) {
      throw new Error('City is required');
    }

    if (!this.postalCode || this.postalCode.trim().length === 0) {
      throw new Error('Postal code is required');
    }

    if (!this.country || this.country.trim().length === 0) {
      throw new Error('Country is required');
    }

    if (this.dateOfBirth > new Date()) {
      throw new Error('Date of birth cannot be in the future');
    }

    const age = this.calculateAge();
    if (age < 18) {
      throw new Error('User must be at least 18 years old');
    }

    const validMembershipTypes = ['standard', 'premium', 'vip'];
    if (!validMembershipTypes.includes(this.membershipType)) {
      throw new Error('Invalid membership type');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private calculateAge(): number {
    const today = new Date();
    let age = today.getFullYear() - this.dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - this.dateOfBirth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < this.dateOfBirth.getDate())) {
      age--;
    }
    
    return age;
  }

  public static create(
    id: string,
    personalIdentifier: string,
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    address: string,
    city: string,
    postalCode: string,
    country: string,
    dateOfBirth: Date,
    membershipType: string = 'standard',
    active: boolean = true
  ): User {
    return new User(
      id,
      personalIdentifier,
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      postalCode,
      country,
      dateOfBirth,
      active,
      membershipType
    );
  }

  public updateStatus(active: boolean): User {
    return new User(
      this.id,
      this.personalIdentifier,
      this.firstName,
      this.lastName,
      this.email,
      this.phone,
      this.address,
      this.city,
      this.postalCode,
      this.country,
      this.dateOfBirth,
      active,
      this.membershipType,
      this.registrationDate,
      this.createdAt,
      new Date()
    );
  }

  public updateMembership(membershipType: string): User {
    const validMembershipTypes = ['standard', 'premium', 'vip'];
    if (!validMembershipTypes.includes(membershipType)) {
      throw new Error('Invalid membership type');
    }
    
    return new User(
      this.id,
      this.personalIdentifier,
      this.firstName,
      this.lastName,
      this.email,
      this.phone,
      this.address,
      this.city,
      this.postalCode,
      this.country,
      this.dateOfBirth,
      this.active,
      membershipType,
      this.registrationDate,
      this.createdAt,
      new Date()
    );
  }

  public updateContactInfo(phone: string, address: string, city: string, postalCode: string): User {
    return new User(
      this.id,
      this.personalIdentifier,
      this.firstName,
      this.lastName,
      this.email,
      phone,
      address,
      city,
      postalCode,
      this.country,
      this.dateOfBirth,
      this.active,
      this.membershipType,
      this.registrationDate,
      this.createdAt,
      new Date()
    );
  }

  public getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  public getAge(): number {
    return this.calculateAge();
  }

  public toJSON() {
    return {
      id: this.id,
      personalIdentifier: this.personalIdentifier,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.getFullName(),
      email: this.email,
      phone: this.phone,
      address: this.address,
      city: this.city,
      postalCode: this.postalCode,
      country: this.country,
      dateOfBirth: this.dateOfBirth,
      age: this.getAge(),
      active: this.active,
      membershipType: this.membershipType,
      registrationDate: this.registrationDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
