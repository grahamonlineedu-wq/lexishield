const axios = require('axios');
const crypto = require('crypto');

const FINCRA_SECRET = process.env.FINCRA_SECRET_KEY;
const FINCRA_WEBHOOK_SECRET = process.env.FINCRA_WEBHOOK_SECRET;
const FINCRA_BASE = process.env.FINCRA_BASE_URL || 'https://api.fincra.com';

const ALLOWED_PLANS = new Set(['starter', 'pro_monthly', 'pro_yearly']);
const planToKobo = {
  starter: 250000,
  pro_monthly: 1000000,
  pro_yearly: 9000000
};

const planToCredits = {
  starter: 10,
  pro_monthly: 200,
  pro_yearly: 2400
};

const normalizeEmail = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

exports.initializePayment = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const planType = req.body?.planType;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'A valid email is required.' });
    }

    if (!ALLOWED_PLANS.has(planType)) {
      return res.status(400).json({ error: 'Invalid plan type.' });
    }

    if (!FINCRA_SECRET) {
      return res.status(500).json({ error: 'Payment configuration is missing.' });
    }

    const amount = planToKobo[planType];

    const callback = `${req.protocol}://${req.get('host')}/api/v1/billing/verify`;

    // Build the request payload using common Fincra fields; provider specifics may vary by account
    const payload = {
      amount,
      payment_channel: 'card',
      currency: 'NGN',
      callback_url: `${callback}?planType=${encodeURIComponent(planType)}`,
      customer: { email },
      metadata: { planType }
    };

    const response = await axios.post(`${FINCRA_BASE}/v2/payments`, payload, {
      headers: {
        Authorization: `Bearer ${FINCRA_SECRET}`,
        'Content-Type': 'application/json'
      }
    });

    // Fincra responses vary; try common locations for a checkout URL/reference
    const data = response.data || {};
    const paymentData = data.data || data;
    const checkoutUrl = paymentData.checkout_url || paymentData.payment_url || paymentData.redirect_url || paymentData.payment_redirect_url;
    const reference = paymentData.reference || paymentData.payment_reference || paymentData.id || null;

    return res.status(200).json({
      success: true,
      authorization_url: checkoutUrl,
      reference
    });
  } catch (error) {
    console.error('Fincra Initialize Error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to initialize payment.' });
  }
};

// Synchronous verify endpoint used by redirect (optional)
exports.verifyPayment = async (req, res) => {
  const reference = String(req.query?.reference || '').trim() || String(req.query?.payment_reference || '').trim();
  const planType = String(req.query?.planType || '').trim();

  if (!reference) {
    return res.redirect('/?payment=failed');
  }

  if (!FINCRA_SECRET) {
    return res.redirect('/?payment=failed');
  }

  try {
    const response = await axios.get(`${FINCRA_BASE}/v2/payments/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${FINCRA_SECRET}` }
    });

    const payment = response.data?.data || response.data;
    const status = (payment?.status || payment?.payment_status || '').toLowerCase();

    if (status === 'success' || status === 'completed' || status === 'paid') {
      // In production, update user scan credits or active subscription in your database here
      return res.redirect(`/?payment=success&planType=${encodeURIComponent(planType)}`);
    }

    return res.redirect('/?payment=failed');
  } catch (error) {
    console.error('Fincra Verify Error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Payment verification failed.' });
  }
};

// Webhook endpoint to receive event notifications from Fincra
exports.handleWebhook = async (req, res) => {
  try {
    const raw = req.body; // express.raw buffer
    const signatureHeader = req.headers['x-fincra-signature'] || req.headers['x-signature'] || req.headers['x-hub-signature'] || req.headers['signature'];

    if (!FINCRA_WEBHOOK_SECRET) {
      console.warn('FINCRA_WEBHOOK_SECRET is not configured; rejecting webhook.');
      return res.status(403).send('Webhook not configured');
    }

    if (!signatureHeader) {
      console.warn('Webhook missing signature header');
      return res.status(401).send('Missing signature');
    }

    const computed = crypto.createHmac('sha256', FINCRA_WEBHOOK_SECRET).update(raw).digest('hex');

    // Timing-safe comparison
    const headerSig = String(signatureHeader).trim();
    const bufA = Buffer.from(computed, 'utf8');
    const bufB = Buffer.from(headerSig, 'utf8');
    if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
      console.warn('Webhook signature mismatch');
      return res.status(401).send('Invalid signature');
    }

    const event = JSON.parse(raw.toString('utf8'));

    // Normalize event payload
    const eventType = event.event || event.type || event.event_type || '';
    const payment = event.data || event.payment || event;
    const reference = payment?.reference || payment?.payment_reference || payment?.id || null;
    const amount = payment?.amount || payment?.value || null;
    const currency = payment?.currency || 'NGN';
    const status = (payment?.status || payment?.payment_status || '').toLowerCase();
    const metadata = payment?.metadata || {};
    const userId = metadata?.user_id || metadata?.userId || null;
    const planType = metadata?.planType || metadata?.plan_type || null;

    // Only process successful payments
    if (status === 'success' || status === 'completed' || status === 'paid') {
      if (req.app && req.app.locals && req.app.locals.sql) {
        const sql = req.app.locals.sql;
        try {
          await sql`
            INSERT INTO payments (reference, user_id, plan_type, amount, currency, status, metadata)
            VALUES (
              ${reference},
              ${userId},
              ${planType},
              ${amount},
              ${currency},
              ${status},
              ${JSON.stringify(metadata)}
            )
            ON CONFLICT (reference) DO UPDATE SET status = EXCLUDED.status, metadata = EXCLUDED.metadata
          `;

          if (userId && planType) {
            const creditsToAdd = planToCredits[planType] || 0;
            if (creditsToAdd > 0) {
              await sql`
                INSERT INTO user_credits (user_id, credits)
                VALUES (${userId}, ${creditsToAdd})
                ON CONFLICT (user_id) DO UPDATE SET credits = user_credits.credits + EXCLUDED.credits
              `;
            }
          }
        } catch (dbErr) {
          console.error('Webhook DB error:', dbErr.message);
        }
      } else {
        console.warn('SQL client not available on app.locals; skipping DB write for webhook');
      }
    }

    // Respond quickly to webhook
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err.message);
    return res.status(500).send('Webhook processing error');
  }
};
