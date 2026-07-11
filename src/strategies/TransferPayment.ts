import { PaymentStrategy, PaymentResult } from "../interfaces/PaymentStrategy.js";

export class TransferPayment implements PaymentStrategy {
    methodName = "TRANSFER";
    constructor(private bankName: string) {}

    processPayment(amount: number): PaymentResult {
        // Simulasi Transfer selalu sukses
        return {
            success: true,
            transactionCode: `TRF-${this.bankName}-${Date.now()}`
        };
    }
}
