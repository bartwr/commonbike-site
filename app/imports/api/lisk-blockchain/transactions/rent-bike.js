// import BigNum from '@liskhq/bignum';
const { BigNum } = require('@liskhq/bignum');
const { TransferTransaction, TransactionError, transfer } = require('@liskhq/lisk-transactions');
const { BikeValidator } = require('./bike.domain');

/**
 * Assets : {
 *     id: string
 *     // lastRentTransactionId: string, Transaction.id
 *     // lastReturnTransactionId: string, Transaction.id
 * }
 * Amount: BigNum string, bike deposit
 */
class RentBikeTransaction extends TransferTransaction {
    static get TYPE () {
        return 1002;
    }

    validateAsset() {
        const errors = [];

        const validId = BikeValidator.id(this.id, this.asset.id);
        const validDeposit = BikeValidator.deposit(this.id, this.amount);

        if (validId !== true) {
            errors.push(validId);
        }

        if (validDeposit !== true) {
            errors.push(validDeposit);
        }

        return errors;
    }

    prepare(store) {
        const promises = [super.prepare(store)];
        return Promise.all(promises);
    }

    applyAsset(store) {
        super.applyAsset(store);

        const errors = [];

        // const recipient = store.account.get(this.recipientId);
        // const sender = store.account.get(this.senderId);
        const object = store.account.get(this.asset.id);

        // Check if this object does exist
        if (object === undefined) {
            errors.push(new TransactionError("Object not found", this.id, "this.asset.id", this.asset.id, "An existing object ID on recipient account"));
        }

        // Check if object is not rented
        if (object.rentedBy !== undefined) {
            errors.push(new TransactionError("Object already rented", this.id, "this.asset.id", this.asset.id, "The ID of a currently non-rented object"));
        }

        // Get the deposit amount
        const deposit = Number(object.deposit);

        // Check if user sent the exact deposit amount
        if (! deposit === this.amount) {
            errors.push(new TransactionError("Invalid amount", this.id, "this.amount", this.amount, `The precise amount of the objects deposit : ${object.deposit.toString()}`));
        }

        // Ok, everything is fine
        // Set who's the new renter for this object:
        object.rentedBy = this.senderId;
        object.rentalStartDatetime = this.timestamp;
        object.rentalEndDatetime = undefined;

        // Finally, set this info in the recipients account
        store.account.set(this.asset.id, object);

        return errors;
    }

    undoAsset(store) {
        super.undoAsset(store);

        const errors = [];

        // Get object
        const object = store.account.get(this.asset.id);

        // Set: Not currently rented
        object.rentedBy = null;
        store.account.set(this.asset.id, object);

        // If errors: Return
        return errors;
    }
}

module.exports = RentBikeTransaction;
