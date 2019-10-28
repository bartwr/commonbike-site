export const CoinSchema = new SimpleSchema({
  'passphrase': {
    type: String,
    label: "Passphrase",
    defaultValue: ''
  },
  'privateKey': {
    type: String,
    label: "Private Key",
    defaultValue: ''
  },
  'publicKey': {
    type: String,
    label: "Public Key",
    defaultValue: ''
  },
  'address': {
    type: String,
    label: "Address",
    defaultValue: ''
  },
});
