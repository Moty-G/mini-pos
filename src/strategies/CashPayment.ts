import { PaymentStrategy, PaymentResult } from "../interfaces/PaymentStrategy.js";

export class CashPayment implements PaymentStrategy {
    methodName = "CASH";
    constructor(private cashReceived: number) {}

    processPayment(amount: number): PaymentResult {
        if (this.cashReceived < amount) {
            return {
                success: false,
                transactionCode: "",
                message: `Uang kurang. Dibutuhkan ${amount}, diterima ${this.cashReceived}`
            };
        }
        return {
            success: true,
            transactionCode: `CASH-${Date.now()}`,
            changeAmount: this.cashReceived - amount
        };
    }
}
