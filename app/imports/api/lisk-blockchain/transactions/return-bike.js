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

        const sender = store.account.get(this.senderId);        // = bike
        const recipient = store.account.get(this.recipientId);  // = renter
        const object = store.account.get(this.asset.id);        // = bike object

        if (object === undefined) {
            errors.push(new TransactionError("Object not found", this.id, "this.asset.id", this.asset.id, "An existing object ID on recipient account"));
        }

        if (object.asset.rentedBy === undefined) {
            errors.push(new TransactionError("Object not currently rented", this.id, "this.asset.id", this.asset.id, "The ID of a currently rented object"));
        }

        if (object.address !== this.senderId) {
            errors.push(new TransactionError(`Bike can only be returned from its own account or by its owner`, this.id, "this.asset.address", this.senderId, "The address of the bike"));
        }

        const rentStartTimestamp = object.asset.rentalStartDatetime; // this.timestamp - 15 * 60; // 15 minutes
        const rentalDuration = this.timestamp - rentStartTimestamp;
        const billedHours = Math.ceil(rentalDuration / 3600);
        const billedAmount = Number(object.asset.pricePerHour) * Number(billedHours);
        const paidAmount = object.asset.deposit;
        
        // Calculate unused deposit
        const netDepositReturn = Number(paidAmount) - Number(billedAmount);//19
        // Set new bikes balance
        const newBikeBalance = (Number(sender.balance) - Number(netDepositReturn)).toString();//120-19 = 101
        // Set new renter's balance
        const newRenterBalance = (Number(recipient.balance) + Number(netDepositReturn)).toString();// 80 + 19 = 99

        object.asset.rentalEndDatetime = this.timestamp;
        object.asset.rentedBy = "";

        if(this.asset.location!=false) {
          object.asset.location=this.asset.location
        }

        // Update users balance
        store.account.set(this.recipientId, {...recipient, balance: newRenterBalance});

        // Store bike object
        object.balance = newBikeBalance;
        store.account.set(this.asset.id, object);

        return errors;
    }

    undoAsset(store) {
        const errors = [
            new TransactionError(JSON.stringify({
                'We didnt undo the asset in return-bike custom tx': true
            }))
        ]
        return errors;

        super.undoAsset(store);

        const errors = [];

        const sender = store.account.get(this.senderId);        // bike
        const recipient = store.account.get(this.recipientId);  // renter
        const object = store.account.get[this.asset.id];        // bike object

        const rentalDuration = this.timestamp - lastRentTransaction.timestamp;
        const billedHours = Math.ceil(rentalDuration / 3600);
        const billedAmount = Number(object.asset.pricePerHour) * Number(billedHours);
        const netDepositReturn = Number(lastRentTransaction.deposit) - Number(billedAmount);
        const newBikeBalance = (Number(recipient.balance) + Number(netDepositReturn)).toString();
        const newRenterBalance = (Number(sender.balance) - Number(netDepositReturn)).toString();

        store.account.set(this.senderId, { ...sender, balance: newRenterBalance});

        object.asset.rentalEndDatetime = this.timestamp;
        object.asset.rentedBy = this.senderId;
        
        if(this.asset.location!=false&&this.asset.prevlocation!=false) {
          object.asset.location=this.asset.prevlocation
        }

        recipient.balance = newBikeBalance;

        store.account.set(this.asset.id, object);
        store.account.set(this.recipientId, recipient);

        return errors;
    }
}

module.exports = ReturnBikeTransaction;
