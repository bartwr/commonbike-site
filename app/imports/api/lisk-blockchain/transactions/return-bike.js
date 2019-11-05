const { BigNum } = require('@liskhq/bignum');
const { BaseTransaction, TransactionError } = require('@liskhq/lisk-transactions');
const { BikeValidator } = require('./bike.domain');

/**
 * Assets : {
 *     id: string
 *     // lastRentTransactionId: string, Transaction.id
 *     // lastReturnTransactionId: string, Transaction.id
 * }
 */
class ReturnBikeTransaction extends BaseTransaction {
    static get TYPE () {
        return 1003;
    }

    validateAsset() {
        const errors = [];

        const validId = BikeValidator.id(this.id, this.asset.id);

        if (validId !== true) {
            errors.push(validId);
        }

        return errors;
    }

    prepare(store) {
        const promises = [super.prepare(store), store.account.cache([ { address: this.recipientId }])];
        return Promise.all(promises);
    }

    applyAsset(store) {

        const errors = [];

        const sender = store.account.get(this.senderId);
        const recipient = store.account.get(this.recipientId);
        const object = store.account.get(this.asset.id);

        if (object === undefined) {
            errors.push(new TransactionError("Object not found", this.id, "this.asset.id", this.asset.id, "An existing object ID on recipient account"));
        }

        if (object.rentedBy === undefined) {
            errors.push(new TransactionError("Object not currently rented", this.id, "this.asset.id", this.asset.id, "The ID of a currently rented object"));
        }

        if (object.rentedBy !== this.senderId) {
            errors.push(new TransactionError(`Bike can only be returned by the one who rented it`, this.id, "this.asset.id", this.asset.id, "Nice try"));
        }

        const rentStartTimestamp = object.rentalStartDatetime; // this.timestamp - 15 * 60; // 15 minutes
        const rentalDuration = this.timestamp - rentStartTimestamp;
        const billedHours = Math.ceil(rentalDuration / 3600);
        const billedAmount = new BigNum(object.pricePerHour).mul(billedHours);        
        const paidAmount = object.deposit;
        
        const netDepositReturn = new BigNum(paidAmount).sub(billedAmount);
        const newRecipientBalance = new BigNum(recipient.balance).sub(netDepositReturn).toString();
        const newSenderBalance = new BigNum(sender.balance).add(netDepositReturn).toString();

        store.account.set(this.senderId, { ...sender, balance: newSenderBalance});

        object.rentalEndDatetime = this.timestamp;
        object.rentedBy = undefined;

        recipient.balance = newRecipientBalance;

        store.account.set(this.recipientId, recipient);

        return errors;
    }

    undoAsset(store) {

        const errors = [];

        const sender = store.account.get(this.senderId);
        const recipient = store.account.get(this.recipientId);
        const object = store.account.get[this.asset.id];

        const rentalDuration = this.timestamp - lastRentTransaction.timestamp;
        const billedHours = Math.ceil(rentalDuration / 3600);
        const billedAmount = new BigNum(object.pricePerHour).mul(billedHours);
        const netDepositReturn = new BigNum(lastRentTransaction.deposit).sub(billedAmount);
        const newRecipientBalance = new BigNum(recipient.balance).add(netDepositReturn).toString();
        const newSenderBalance = new BigNum(sender.balance).sub(netDepositReturn).toString();

        store.account.set(this.senderId, { ...sender, balance: newSenderBalance});

        object.rentalEndDatetime = this.timestamp;
        object.rentedBy = this.senderId;

        recipient.balance = newRecipientBalance;

        store.account.set(this.recipientId, recipient);

        return errors;
    }
}

module.exports = ReturnBikeTransaction;
