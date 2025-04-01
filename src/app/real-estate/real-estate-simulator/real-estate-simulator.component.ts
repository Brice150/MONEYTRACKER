import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RealEstateSimulator } from '../../core/interfaces/real-estate-simulator';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-real-estate-simulator',
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './real-estate-simulator.component.html',
  styleUrl: './real-estate-simulator.component.css',
})
export class RealEstateSimulatorComponent implements OnInit {
  toastr = inject(ToastrService);
  realEstateSimulator: RealEstateSimulator = {
    results: {
      totalCost: 0,
      totalRents: 0,
      totalCharges: 0,
      grossYield: 0,
      netYield: 0,
      cashFlow: 0,
    },
    purchase: {
      price: 100000,
      notaryFees: 0,
    },
    renovation: {
      price: 0,
      furnitureBudget: 0,
    },
    financing: {
      downPayment: 10000,
      loanRate: 3.8,
      insuranceRate: 0.35,
      duration: 20,
      totalBorrowed: 0,
      monthlyPayments: 0,
    },
    annualExpenses: {
      propertyTax: 800,
      pnoInsurance: 200,
      coownershipCharges: 700,
      otherCharges: 0,
    },
    rent: {
      lotsNumber: 1,
      rentPerLot: 710,
    },
  };

  ngOnInit(): void {
    this.calculateAmounts();
  }

  calculateAmounts(): void {
    if (this.isFormValid()) {
      this.calculateTotalCost();
      this.calculateTotalRent();
      this.calculateFinancing();
      this.calculateTotalCharges();
      this.calculateGrossYield();
      this.calculateNetYield();
      this.calculateCashFlow();
    } else {
      this.toastr.info('Invalid Simulator', 'Real Estate Simulator', {
        positionClass: 'toast-bottom-center',
        toastClass: 'ngx-toastr custom error',
      });
    }
  }

  isFormValid(): boolean {
    const isPurchaseValid: boolean =
      !(this.realEstateSimulator.purchase.price < 0) &&
      this.realEstateSimulator.purchase.price !== undefined &&
      this.realEstateSimulator.purchase.price !== null &&
      !(this.realEstateSimulator.purchase.notaryFees < 0) &&
      this.realEstateSimulator.purchase.notaryFees !== undefined &&
      this.realEstateSimulator.purchase.notaryFees !== null;

    const isRenovationValid: boolean =
      !(this.realEstateSimulator.renovation.price < 0) &&
      this.realEstateSimulator.renovation.price !== undefined &&
      this.realEstateSimulator.renovation.price !== null &&
      !(this.realEstateSimulator.renovation.furnitureBudget < 0) &&
      this.realEstateSimulator.renovation.furnitureBudget !== undefined &&
      this.realEstateSimulator.renovation.furnitureBudget !== null;

    const isFinancingValid: boolean =
      !(this.realEstateSimulator.financing.downPayment < 0) &&
      this.realEstateSimulator.financing.downPayment !== undefined &&
      this.realEstateSimulator.financing.downPayment !== null &&
      !(
        this.realEstateSimulator.financing.loanRate < 0 ||
        this.realEstateSimulator.financing.loanRate > 100
      ) &&
      this.realEstateSimulator.financing.loanRate !== undefined &&
      this.realEstateSimulator.financing.loanRate !== null &&
      !(
        this.realEstateSimulator.financing.insuranceRate < 0 ||
        this.realEstateSimulator.financing.insuranceRate > 100
      ) &&
      this.realEstateSimulator.financing.insuranceRate !== undefined &&
      this.realEstateSimulator.financing.insuranceRate !== null &&
      !(
        this.realEstateSimulator.financing.duration < 0 ||
        this.realEstateSimulator.financing.duration > 40
      ) &&
      this.realEstateSimulator.financing.duration !== undefined &&
      this.realEstateSimulator.financing.duration !== null;

    const isAnnualExpensesValid: boolean =
      !(this.realEstateSimulator.annualExpenses.propertyTax < 0) &&
      this.realEstateSimulator.annualExpenses.propertyTax !== undefined &&
      this.realEstateSimulator.annualExpenses.propertyTax !== null &&
      !(this.realEstateSimulator.annualExpenses.pnoInsurance < 0) &&
      this.realEstateSimulator.annualExpenses.pnoInsurance !== undefined &&
      this.realEstateSimulator.annualExpenses.pnoInsurance !== null &&
      !(this.realEstateSimulator.annualExpenses.coownershipCharges < 0) &&
      this.realEstateSimulator.annualExpenses.coownershipCharges !==
        undefined &&
      this.realEstateSimulator.annualExpenses.coownershipCharges !== null &&
      !(this.realEstateSimulator.annualExpenses.otherCharges < 0) &&
      this.realEstateSimulator.annualExpenses.otherCharges !== undefined &&
      this.realEstateSimulator.annualExpenses.otherCharges !== null;

    const isRentValid: boolean =
      !(
        this.realEstateSimulator.rent.lotsNumber < 0 ||
        this.realEstateSimulator.rent.lotsNumber > 100
      ) &&
      this.realEstateSimulator.rent.lotsNumber !== undefined &&
      this.realEstateSimulator.rent.lotsNumber !== null &&
      !(this.realEstateSimulator.rent.rentPerLot < 0) &&
      this.realEstateSimulator.rent.rentPerLot !== undefined &&
      this.realEstateSimulator.rent.rentPerLot !== null;

    return (
      isPurchaseValid &&
      isRenovationValid &&
      isFinancingValid &&
      isAnnualExpensesValid &&
      isRentValid
    );
  }

  calculateTotalCost(): void {
    this.realEstateSimulator.results.totalCost =
      this.realEstateSimulator.purchase.price +
      this.realEstateSimulator.purchase.notaryFees +
      this.realEstateSimulator.renovation.price +
      this.realEstateSimulator.renovation.furnitureBudget;
  }

  calculateTotalRent(): void {
    this.realEstateSimulator.results.totalRents =
      this.realEstateSimulator.rent.lotsNumber *
      this.realEstateSimulator.rent.rentPerLot;
  }

  calculateFinancing(): void {
    this.realEstateSimulator.financing.totalBorrowed =
      this.realEstateSimulator.results.totalCost -
      this.realEstateSimulator.financing.downPayment;
    this.calculateMonthlyPayments();
  }

  calculateMonthlyPayments(): void {
    if (this.realEstateSimulator.financing.duration !== 0) {
      const cost = this.realEstateSimulator.financing.totalBorrowed;
      const annualLoanRate = this.realEstateSimulator.financing.loanRate;
      const annualInsuranceRate =
        this.realEstateSimulator.financing.insuranceRate;
      const years = this.realEstateSimulator.financing.duration;

      const monthlyLoanRate = annualLoanRate / 12 / 100;
      const monthlyInsuranceRate = annualInsuranceRate / 12 / 100;
      const n = years * 12;

      const monthlyPaymentWithoutInsurance =
        (cost * monthlyLoanRate) / (1 - Math.pow(1 + monthlyLoanRate, -n));
      const monthlyInsurancePayment = cost * monthlyInsuranceRate;
      const totalMonthlyPayment =
        monthlyPaymentWithoutInsurance + monthlyInsurancePayment;

      this.realEstateSimulator.financing.monthlyPayments = parseFloat(
        totalMonthlyPayment.toFixed(2)
      );
    } else {
      this.realEstateSimulator.financing.monthlyPayments = 0;
    }
  }

  calculateTotalCharges(): void {
    this.realEstateSimulator.results.totalCharges =
      (this.realEstateSimulator.annualExpenses.propertyTax +
        this.realEstateSimulator.annualExpenses.pnoInsurance +
        this.realEstateSimulator.annualExpenses.coownershipCharges +
        this.realEstateSimulator.annualExpenses.otherCharges) /
      12;
  }

  calculateGrossYield(): void {
    if (this.realEstateSimulator.results.totalCost !== 0) {
      this.realEstateSimulator.results.grossYield =
        (this.realEstateSimulator.results.totalRents * 12) /
        this.realEstateSimulator.results.totalCost;
    } else {
      this.realEstateSimulator.results.grossYield = 0;
    }
  }

  calculateNetYield(): void {
    if (this.realEstateSimulator.results.totalCost !== 0) {
      this.realEstateSimulator.results.netYield =
        ((this.realEstateSimulator.results.totalRents -
          this.realEstateSimulator.results.totalCharges) *
          12) /
        this.realEstateSimulator.results.totalCost;
    } else {
      this.realEstateSimulator.results.netYield = 0;
    }
  }

  calculateCashFlow(): void {
    this.realEstateSimulator.results.cashFlow =
      this.realEstateSimulator.results.totalRents -
      this.realEstateSimulator.results.totalCharges -
      this.realEstateSimulator.financing.monthlyPayments;
  }
}
