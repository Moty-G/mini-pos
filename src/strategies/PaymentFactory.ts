import { PaymentStrategy } from "../interfaces/PaymentStrategy.js";
import { CashPayment } from "./CashPayment.js";
import { QRISPayment } from "./QRISPayment.js";
import { TransferPayment } from "./TransferPayment.js";

export class PaymentFactory {
    static create(type: string, options?: any): PaymentStrategy {
        switch (type.toUpperCase()) {
            case "CASH":
                return new CashPayment(options?.cashReceived || 0);
            case "QRIS":
                return new QRISPayment();
            case "TRANSFER":
                return new TransferPayment(options?.bankName || "UNKNOWN");
            default:
                throw new Error("Tipe pembayaran tidak didukung");
        }
    }
}
