// Business validation rules for automotive industry
export interface ValidationRule {
  field: string;
  rule: (value: any) => string | null;
  message: string;
}

export class AutomotiveValidation {
  // VIN validation (17 characters, alphanumeric, specific pattern)
  static validateVIN(vin: string): string | null {
    if (!vin || vin.length !== 17) {
      return "VIN must be exactly 17 characters long";
    }
    
    // VIN cannot contain I, O, Q characters
    if (/[IOQ]/i.test(vin)) {
      return "VIN cannot contain letters I, O, or Q";
    }
    
    // Check basic alphanumeric pattern
    if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)) {
      return "VIN contains invalid characters";
    }
    
    return null;
  }

  // License plate validation (varies by region, but basic pattern)
  static validateLicensePlate(plate: string): string | null {
    if (!plate) return null; // Optional field
    
    if (plate.length < 2 || plate.length > 8) {
      return "License plate must be 2-8 characters";
    }
    
    if (!/^[A-Z0-9\-\s]*$/i.test(plate)) {
      return "License plate can only contain letters, numbers, hyphens, and spaces";
    }
    
    return null;
  }

  // Phone number validation (US format)
  static validatePhoneNumber(phone: string): string | null {
    if (!phone) return "Phone number is required";
    
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    if (digits.length !== 10) {
      return "Phone number must be 10 digits";
    }
    
    // Check for valid area code (not starting with 0 or 1)
    if (digits[0] === '0' || digits[0] === '1') {
      return "Invalid area code";
    }
    
    return null;
  }

  // Email validation with business rules
  static validateEmail(email: string): string | null {
    if (!email) return null; // Optional in some contexts
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    
    // Business rule: no temp email services
    const tempEmailDomains = ['10minutemail.com', 'tempmail.org', 'guerrillamail.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    if (tempEmailDomains.includes(domain)) {
      return "Temporary email addresses are not allowed";
    }
    
    return null;
  }

  // Vehicle year validation
  static validateVehicleYear(year: number): string | null {
    const currentYear = new Date().getFullYear();
    const oldestYear = 1900;
    
    if (year < oldestYear) {
      return `Vehicle year cannot be before ${oldestYear}`;
    }
    
    if (year > currentYear + 1) {
      return `Vehicle year cannot be more than one year in the future`;
    }
    
    return null;
  }

  // Labor cost validation
  static validateLaborCost(cost: number): string | null {
    if (cost < 0) {
      return "Labor cost cannot be negative";
    }
    
    if (cost > 10000) {
      return "Labor cost seems unusually high. Please verify.";
    }
    
    // Check for reasonable hourly rates (assuming max 50 hours at $200/hour)
    return null;
  }

  // Parts price validation
  static validatePartPrice(price: number): string | null {
    if (price < 0) {
      return "Part price cannot be negative";
    }
    
    if (price > 50000) {
      return "Part price seems unusually high. Please verify.";
    }
    
    return null;
  }

  // Stock quantity validation
  static validateStockQuantity(quantity: number): string | null {
    if (quantity < 0) {
      return "Stock quantity cannot be negative";
    }
    
    if (quantity > 10000) {
      return "Stock quantity seems unusually high. Please verify.";
    }
    
    return null;
  }

  // Part number validation
  static validatePartNumber(partNumber: string): string | null {
    if (!partNumber) return "Part number is required";
    
    if (partNumber.length < 3) {
      return "Part number must be at least 3 characters";
    }
    
    if (partNumber.length > 50) {
      return "Part number cannot exceed 50 characters";
    }
    
    // Basic pattern: letters, numbers, hyphens, periods
    if (!/^[A-Z0-9\-\.]+$/i.test(partNumber)) {
      return "Part number can only contain letters, numbers, hyphens, and periods";
    }
    
    return null;
  }

  // Appointment date validation
  static validateAppointmentDate(date: string): string | null {
    if (!date) return "Appointment date is required";
    
    const appointmentDate = new Date(date);
    const now = new Date();
    const maxFutureDate = new Date();
    maxFutureDate.setFullYear(now.getFullYear() + 1);
    
    if (appointmentDate < now) {
      return "Appointment cannot be scheduled in the past";
    }
    
    if (appointmentDate > maxFutureDate) {
      return "Appointment cannot be scheduled more than 1 year in advance";
    }
    
    // Check if appointment is during business hours (8 AM - 6 PM)
    const hour = appointmentDate.getHours();
    if (hour < 8 || hour >= 18) {
      return "Appointments must be scheduled between 8 AM and 6 PM";
    }
    
    // Check if appointment is on weekend
    const dayOfWeek = appointmentDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return "Appointments cannot be scheduled on weekends";
    }
    
    return null;
  }

  // Discount validation
  static validateDiscount(discountPercent: number, discountAmount: number): string | null {
    if (discountPercent < 0 || discountPercent > 100) {
      return "Discount percentage must be between 0 and 100";
    }
    
    if (discountAmount < 0) {
      return "Discount amount cannot be negative";
    }
    
    if (discountPercent > 50) {
      return "Discount percentage over 50% requires manager approval";
    }
    
    if (discountAmount > 5000) {
      return "Discount amount over $5000 requires manager approval";
    }
    
    return null;
  }

  // Tax rate validation
  static validateTaxRate(taxRate: number): string | null {
    if (taxRate < 0) {
      return "Tax rate cannot be negative";
    }
    
    if (taxRate > 20) {
      return "Tax rate over 20% seems unusually high";
    }
    
    return null;
  }

  // Business name validation
  static validateBusinessName(name: string): string | null {
    if (!name) return "Business name is required";
    
    if (name.length < 2) {
      return "Business name must be at least 2 characters";
    }
    
    if (name.length > 100) {
      return "Business name cannot exceed 100 characters";
    }
    
    // Check for reasonable business name pattern
    if (!/^[a-zA-Z0-9\s\-\&\.\,\']+$/.test(name)) {
      return "Business name contains invalid characters";
    }
    
    return null;
  }

  // Employee role validation
  static validateEmployeeRole(role: string): string | null {
    const validRoles = [
      'Mechanic',
      'Receptionist', 
      'Manager',
      'Service Advisor',
      'Parts Specialist',
      'Technician',
      'Inspector',
      'Other'
    ];
    
    if (!validRoles.includes(role)) {
      return "Please select a valid employee role";
    }
    
    return null;
  }

  // Comprehensive form validation
  static validateForm(formType: string, formData: any): Record<string, string> {
    const errors: Record<string, string> = {};
    
    switch (formType) {
      case 'vehicle':
        const vinError = this.validateVIN(formData.vin);
        if (vinError) errors.vin = vinError;
        
        const plateError = this.validateLicensePlate(formData.license_plate);
        if (plateError) errors.license_plate = plateError;
        
        const yearError = this.validateVehicleYear(formData.year);
        if (yearError) errors.year = yearError;
        break;
        
      case 'customer':
        const phoneError = this.validatePhoneNumber(formData.phone_number);
        if (phoneError) errors.phone_number = phoneError;
        
        const emailError = this.validateEmail(formData.email);
        if (emailError) errors.email = emailError;
        break;
        
      case 'part':
        const partPriceError = this.validatePartPrice(formData.unit_price);
        if (partPriceError) errors.unit_price = partPriceError;
        
        const stockError = this.validateStockQuantity(formData.stock_quantity);
        if (stockError) errors.stock_quantity = stockError;
        
        const partNumberError = this.validatePartNumber(formData.part_number);
        if (partNumberError) errors.part_number = partNumberError;
        break;
        
      case 'service':
        const laborError = this.validateLaborCost(formData.labor_cost);
        if (laborError) errors.labor_cost = laborError;
        break;
        
      case 'appointment':
        const dateError = this.validateAppointmentDate(formData.date);
        if (dateError) errors.date = dateError;
        break;
        
      case 'repairOrder':
        const discountError = this.validateDiscount(
          formData.discount_percent || 0, 
          formData.discount_amount || 0
        );
        if (discountError) errors.discount = discountError;
        
        const taxError = this.validateTaxRate(formData.tax_percent || 0);
        if (taxError) errors.tax_percent = taxError;
        break;
    }
    
    return errors;
  }
}

// Format phone number for display
export const formatPhoneNumber = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Format VIN for display (groups of 4)
export const formatVIN = (vin: string): string => {
  if (vin.length === 17) {
    return `${vin.slice(0, 4)} ${vin.slice(4, 8)} ${vin.slice(8, 12)} ${vin.slice(12)}`;
  }
  return vin;
};
