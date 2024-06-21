import './App.css';
import axios from 'axios';
import React from 'react';

function App() {
  const [responseId, setResponseId] = React.useState("");
  const [responseState, setResponseState]= React.useState([]);

  const loadScript = (src) => {
    return new Promise((resolve)=> {
      const script = document.createElement("script");

      script.src =src;

      script.onload = () => {
        resolve(true)
      }
      script.onerror = () => {
        resolve(false)
      }

      document.body.appendChild(script);
    })
  }

  const createRazorpayOrder = (amount) => {
    let data = JSON.stringify({
      amount: amount*100,
      currency: 'INR'
    })

    let config = {
      method:"post",
      maxBodyLength: Infinity,
      url: "http://localhost:5000/orders",
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    }

    axios.request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data))
      handleRazorpayScreen(response.data.amount)
    })
    .catch((error) => {
      console.log("error at", error)
    })
  }

  const handleRazorpayScreen = async(amount) => {
    const res = await loadScript("https:/checkout.razorpay.com/v1/checkout.js")

    if(!res){
      alert("some error at razorpay screen loading")
      return;
    }

    const options = {
      key: 'rzp_test_P4cZUZOKdCUg6G',
      amount: amount,
      currency: 'INR',
      name: "madhav",
      descriptoin:" payment to madhav",
      handler:function(response) {
        setResponseId(response.razorpay_payment_id)
      },
      prefill: {
        name:"madhav",
        email:"madhavsamdani@gmail.com"
      },
      theme: {
        color:"#F4C430"
      }

    }

    const paymentObject = new window.Razorpay(options)
    paymentObject.open()
  }

  const paymentFetch = (e) => {
    e.preventDefault();

    const paymentId = e.target.paymentId.value;

    axios.get(`http://localhost:5000/payment/${paymentId}`)
    .then((response) => {
      console.log(response.data);
      setResponseState(response.data)
    })
    .catch((error) => {
      console.log("error occured", error)
    })
  }
  return (
    <div className="App">
      <button onClick={() => createRazorpayOrder(100)}>payment of rupees 100</button>
      {responseId && <p>{responseId}</p>}
      <h1>Payment Verification Form</h1>
      <form onSubmit={paymentFetch}>
        <input type="text" name ="paymentId" />
        <button type='submit'>Fetch Payment</button>
        {responseState.length!==0 && (
          <ul>
            <li>Amount: {responseState.amount / 100} Rs.</li>
            <li>currency: {responseState.currency}</li>
            <li>status: {responseState.status}</li>
            <li>Method: {responseState.method}</li>
          </ul>
        )}
      </form>
    </div>
  );
}

export default App;
