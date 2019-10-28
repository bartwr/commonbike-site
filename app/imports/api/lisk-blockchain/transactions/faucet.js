const { BigNum } = require('lisk-sdk');
const { BaseTransaction } = require('@liskhq/lisk-transactions');

class FaucetTransaction extends BaseTransaction {
    static get TYPE () {
        return 777;
    }

    async prepare(store) {
        await store.account.cache([ { address: this.recipientId } ]);
    }

    validateAsset() {
        return [];
    }

    applyAsset(store) {

        const recipient = store.account.get(this.recipientId);

        store.account.set(this.recipientId, {
            ...recipient,
            balance: new BigNum(recipient.balance).add(this.amount).toString(),
        });

        return [];
    }

    undoAsset(store) {

        const recipient = store.account.get(this.recipientId);

        store.account.set(this.recipientId, {
            ...recipient,
            balance: new BigNum(recipient.balance).sub(this.amount).toString(),
        });

        return [];
    }
}

module.exports = FaucetTransaction;
