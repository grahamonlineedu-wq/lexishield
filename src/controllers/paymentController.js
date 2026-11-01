const fincra = require('../services/fincra');

exports.getBusinessProfile = async (req, res) => {
  try {
    const business = await fincra.getBusiness();
    res.json({ success: true, data: business });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
EOFmkdir -p src/services
cat > src/services/fincra.js << 'EOF'
const axios = require('axios');

class FincraService {
  constructor() {
    this.client = axios.create({
      baseURL: process.env.FINCRA_BASE_URL || 'https://sandboxapi.fincra.com',
      headers: {
        'api-key': process.env.FINCRA_SECRET_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
  }

  async getBusiness() {
    try {
      const { data } = await this.client.get('/profile/business/me');
      return data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Fincra API key is invalid or for wrong environment');
      }
      throw new Error(`Fincra API error: ${error.message}`);
    }
  }
}

module.exports = new FincraService();
EOFcat > src/routes/payment.js << 'EOF'
const express = require('express');
const { getBusinessProfile } = require('../controllers/paymentController');
const router = express.Router();

router.get('/business', getBusinessProfile);

module.exports = router;
