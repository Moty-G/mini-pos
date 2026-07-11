export class TransactionDetail {
    constructor(
        public productId: number,
        public productName: string,
        public price: number,
        public quantity: number,
        public subtotal: number
    ) {}
}

export class Transaction {
    constructor(
        public id: number,
        public code: string,
        public userId: number,
        public items: TransactionDetail[],
        public totalAmount: number,
        public paymentMethod: string,
        public paymentStatus: string,
        public transactionDate: Date
    ) {}
}
