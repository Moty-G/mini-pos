export interface PaymentResult {
    success: boolean;
    transactionCode: string;
    message?: string;
    changeAmount?: number;
}

export interface PaymentStrategy {
    methodName: string;
    processPayment(amount: number): PaymentResult;
}
