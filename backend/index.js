const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Razorpay = require("razorpay");

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded( {extended: true }));
app.use(cors());

app.get('/' ,(req,res) => {
    res.end("Hello World");
})

// API- to generate the order ID
app.post('/orders', async(req,res) => {
    const razorpay =new Razorpay({
        key_id: "rzp_test_P4cZUZOKdCUg6G",
        key_secret: "GcdW8oiIx9IGcCxm8COuragS"
    })
    const options = {
        amount: req.body.amount,
        currency: req.body.currency,
        receipt: "receipt1",
        payment_capture: 1
    }

    try{
        // telling razorpay to create order with ref to options
        const response = await razorpay.orders.create(options)

        res.json({
            order_id: response.id,
            currency: response.currency,
            amount: response.amount

        }) 
    } catch (error) {
        res.status(500).send("Internal server error")
    }
})

// API - TO FETCH PAYMENT through payment ID
app.get("/payment/:paymentId", async(req,res) => {
    const {paymentId} = req.params;

    const razorpay = new Razorpay({
        key_id: "rzp_test_P4cZUZOKdCUg6G",
        key_secret: "GcdW8oiIx9IGcCxm8COuragS"
    })

    try{
        // fetching the payment that have been already done using paymentid
        const payment = await razorpay.payments.fetch(paymentId)
        if(!payment){
            return res.status(500).json("Error at razorpay loading")
        }

        res.json({
            status: payment.status,
            method: payment.method,
            amount: payment.amount,
            currency: payment.currency
        })
    } catch(error){
        res.status(500).json("failed to fetch")
    }

    
})

app.listen(port,()=>{
    console.log(`server is running on ${port}`);
})