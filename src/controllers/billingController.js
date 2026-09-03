const axios = require('axios');

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

// Initialize Subscription / Scan Credit Purchase
exports.initializePayment = async (req, res) => {
  try {
    const { email, planType } = req.body; // e.g., 'pro_monthly'

    const amountInKobo = planType === 'pro_monthly' ? 1000000 : 250000; // 10,000 NGN or 2,500 NGN

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amountInKobo,
        callback_url: `${req.protocol}://${req.get('host')}/api/v1/billing/verify`,
        metadata: { planType }
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return res.status(200).json({
      success: true,
      authorization_url: response.data.data.authorization_url,
      reference: response.data.data.reference
    });
  } catch (error) {
    console.error('Paystack Error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to initialize payment.' });
  }
};

// Verify Payment Callback
exports.verifyPayment = async (req, res) => {
  const { reference } = req.query;

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` }
      }
    );

    if (response.data.data.status === 'success') {
      // In production, update user scan credits or active subscription in your database here
      return res.redirect('/?payment=success');
    } else {
      return res.redirect('/?payment=failed');
    }
  } catch (error) {
    return res.status(500).json({ error: 'Payment verification failed.' });
  }
};

