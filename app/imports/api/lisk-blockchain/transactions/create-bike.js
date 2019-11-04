const { BaseTransaction, TransferTransaction, TransactionError } = require('@liskhq/lisk-transactions');
const { Bike, BikeValidator } = require('./bike.domain');
const { BigNum } = require('@liskhq/bignum');

const defaultLocation = {
    latitude: '48.8534',
    longitude: '2.3488',
}; // Paris

/**
 * Assets : {
 *     id: string
 *     title: string,
 *     description: string
 *     pricePerHour: BigNum compatible string
 *     deposit: BigNum compatible string
 * }
 */
class CreateBikeTransaction extends BaseTransaction {
    static get TYPE () {
        return 1001;
    }

    static get FEE () {
        return TransferTransaction.FEE;
    };

    validateAsset() {
        const errors = [];

        const validId = BikeValidator.id(this.id, this.asset.id);
        const validOwnerId = BikeValidator.id(this.senderId, this.asset.id);
        // const validPricePerHour = BikeValidator.pricePerHour(this.id, this.asset.pricePerHour);
        // const validDeposit = BikeValidator.deposit(this.id, this.asset.pricePerHour);

        if (validId !== true) {
            errors.push(validId);
        }

        // if (validPricePerHour !== true) {
        //     errors.push(validPricePerHour);
        // }

        // if (validDeposit !== true) {
        //     errors.push(validDeposit);
        // }

        return errors;
    }

    async prepare(store) {
        return Promise.all([
            super.prepare(store),
            store.account.cache([ { address: this.recipientId }])
        ]);
    }

    applyAsset(store) {
        const errors = [];

        const recipient = store.account.get(this.recipientId);
        if (recipient.asset !== undefined) {
          errors.push(new TransactionError("Bike with this Id already exist", this.id, 'this.asset.id', this.asset.id, "A non-registered Id"));
        }

        const providedLocation = {
            latitude: this.asset.latitude,
            longitude: this.asset.longitude,
        };

        const location = BikeValidator.location(this.id, providedLocation) === true ? providedLocation : defaultLocation;
        
        let assetdata = {
          id: recipient.id,
          title: this.asset.title,
          description: this.asset.description,
          ownerId: this.senderId,
          pricePerHour: transactions.utils.convertLSKToBeddows("1"),
          deposit: transactions.utils.convertLSKToBeddows("20"),
          location: location
        }
        recipient.asset = assetdata;

        store.account.set(this.recipientId, recipient);

        return errors;
    }

    undoAsset(store) {
        const errors = [];
        const recipient = store.account.get(this.recipientId);

        delete recipient.asset;

        store.account.set(this.recipientId, recipient);

        return errors;
    }
}

module.exports = CreateBikeTransaction;
