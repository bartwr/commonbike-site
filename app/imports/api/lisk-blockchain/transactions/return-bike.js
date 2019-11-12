const { TransferTransaction, TransactionError, transfer } = require('@liskhq/lisk-transactions');
const { BikeValidator } = require('./bike.domain');

/**
 * Assets : {
 *     id: string
 *     // lastRentTransactionId: string, Transaction.id
 *     // lastReturnTransactionId: string, Transaction.id
 * }
 */
class ReturnBikeTransaction extends TransferTransaction {
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
        super.applyAsset(store);

        const errors = [];

        const sender = store.account.get(this.senderId);
        const recipient = store.account.get(this.recipientId);
        const object = store.account.get(this.asset.id);

        if (object === undefined) {
            errors.push(new TransactionError("Object not found", this.id, "this.asset.id", this.asset.id, "An existing object ID on recipient account"));
        }

        if (object.asset.rentedBy === undefined) {
            errors.push(new TransactionError("Object not currently rented", this.id, "this.asset.id", this.asset.id, "The ID of a currently rented object"));
        }

        if (object.asset.rentedBy !== this.senderId) {
            errors.push(new TransactionError(`Bike can only be returned by the one who rented it`, this.id, "this.asset.id", this.asset.id, "Nice try"));
        }

        const rentStartTimestamp = object.asset.rentalStartDatetime; // this.timestamp - 15 * 60; // 15 minutes
        const rentalDuration = this.timestamp - rentStartTimestamp;
        const billedHours = Math.ceil(rentalDuration / 3600);
        const billedAmount = Number(object.asset.pricePerHour) * Number(billedHours);
        const paidAmount = object.asset.deposit;
        
        const netDepositReturn = Number(paidAmount) - Number(billedAmount);
        const newRecipientBalance = (Number(recipient.balance) - Number(netDepositReturn)).toString();
        const newSenderBalance = (Number(sender.balance) + Number(netDepositReturn)).toString();

        object.asset.rentalEndDatetime = this.timestamp;
        object.asset.rentedBy = "";

        recipient.balance = newRecipientBalance;
        
        if(this.asset.location!=false) {
          object.asset.location=this.asset.location
        }

        // LOGGING:
        // errors.push(new TransactionError(JSON.stringify(object)));

        // Update senders balance
        store.account.set(this.senderId, {...sender, balance: newSenderBalance});

        // Store new recipient balance
        store.account.set(this.recipientId, recipient);

        // Store bike object
        store.account.set(this.asset.id, object);

        return errors;
    }

    undoAsset(store) {
        super.undoAsset(store);

        const errors = [];

        const sender = store.account.get(this.senderId);
        const recipient = store.account.get(this.recipientId);
        const object = store.account.get[this.asset.id];

        const rentalDuration = this.timestamp - lastRentTransaction.timestamp;
        const billedHours = Math.ceil(rentalDuration / 3600);
        const billedAmount = Number(object.asset.pricePerHour) * Number(billedHours);
        const netDepositReturn = Number(lastRentTransaction.deposit) - Number(billedAmount);
        const newRecipientBalance = (Number(recipient.balance) + Number(netDepositReturn)).toString();
        const newSenderBalance = (Number(sender.balance) - Number(netDepositReturn)).toString();

        store.account.set(this.senderId, { ...sender, balance: newSenderBalance});

        object.asset.rentalEndDatetime = this.timestamp;
        object.asset.rentedBy = this.senderId;
        
        if(this.asset.location!=false&&this.asset.prevlocation!=false) {
          object.asset.location=this.asset.prevlocation
        }

        recipient.balance = newRecipientBalance;

        store.account.set(this.asset.id, object);
        store.account.set(this.recipientId, recipient);

        return errors;
    }
}

module.exports = ReturnBikeTransaction;
