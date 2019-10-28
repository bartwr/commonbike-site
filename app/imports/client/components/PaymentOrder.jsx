import React from 'react'
// import RaisedButton from '/imports/client/components/RaisedButton.jsx';
import Button from '/imports/client/components/Button.jsx';

class PaymentOrder extends React.Component {
  constructor(props) {
    super(props)

    const { internalPaymentId } = props.match.params
    this.state = {
      internalPaymentId: internalPaymentId,
      paymentStatus: '?'
    }

    // console.log('PaymentOrder', this.state)

    Meteor.call('paymentservice.getstatus', internalPaymentId,
      (error, status) => {
        if (error) return console.error(error)
        this.setState({paymentStatus: status})
        // console.log(status)
      }
    )
  }

  onAgain() {
    document.location = "/commonbike-ui"
  }

  render() {
    return (
      <div>
        <h2>Payment order {this.state.internalPaymentId} is {this.state.paymentStatus}</h2>
        <Button onClick={this.onAgain}>Again</Button>

      </div>
    )
  } // end of render()
} // end of class PaymentOrder

export default PaymentOrder
