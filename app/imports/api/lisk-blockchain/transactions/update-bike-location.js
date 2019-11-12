const { BigNum } = require('@liskhq/bignum');
const { BaseTransaction, TransactionError } = require('@liskhq/lisk-transactions');
const { BikeValidator } = require('./bike.domain');

/**
 * Assets : {
 *     id: string
 *     previousLatitude: string, Geoloc string
 *     previousLongitude: string, Geoloc string
 *     latitude: string, Geoloc string
 *     longitude: string, Geoloc string
 * }
 */
class UpdateBikeLocationTransaction extends BaseTransaction {
    static get TYPE () {
        return 1004;
    }

    validateAsset() {
        const errors = [];

        const validId = BikeValidator.id(this.id, this.asset.id);
        const validLocation = BikeValidator.location(this.id, {
            latitude: this.asset.latitude,
            longitude: this.asset.longitude,
        });

        if (validId !== true) {
            errors.push(validId);
        }

        if (validLocation !== true) {
            errors.push(validLocation);
        }

        return errors;
    }

    async prepare(store) {
        return Promise.all([
            super.prepare(store),
            store.account.cache([ { address: this.recipientId }]),
        ]);
    }

    applyAsset(store) {
        const errors = [];

        const object = store.account.get(this.asset.id);

        if (object === undefined) {
            errors.push(new TransactionError("Object not found", this.id, "this.asset.id", this.asset.id, "An existing object ID on recipient account"));
        }

        // if (object.id !== this.senderId) {
        //     errors.push(new TransactionError(`Object position can only be updated by the object itself`, this.id, "this.asset.id", this.asset.id, "Nice try"));
        // }
        
        // if(object&&object.location) {
        //   if (true||this.asset.previousLatitude !== object.location.latitude || this.asset.previousLongitude !== object.location.longitude) {
        //       errors.push(new TransactionError("Invalid previous location", this.id));
        //   }
        //
        //   object.location = {
        //     latitude: this.asset.latitude.toString(),
        //     longitude: this.asset.longitude.toString()
        //   }
        // };
        
        object.asset.location = { latitude: this.asset.latitude, longitude: this.asset.longitude };

        store.account.set(this.asset.id, object);

        return errors;
    }

    undoAsset(store) {
        const errors = [];
        const object = store.account.get(this.asset.id);

        // object.location.latitude = this.asset.previousLatitude;
        // object.location.longitude = this.asset.previousLongitude;

        store.account.set(this.asset.id, object);

        return errors;
    }
}

module.exports = UpdateBikeLocationTransaction;
