import { PaymentStrategy, PaymentResult } from "../interfaces/PaymentStrategy.js";

export class QRISPayment implements PaymentStrategy {
    methodName = "QRIS";

    processPayment(amount: number): PaymentResult {
        // Simulasi QRIS selalu sukses
        return {
            success: true,
            transactionCode: `QRIS-${Date.now()}`
        };
    }
}
