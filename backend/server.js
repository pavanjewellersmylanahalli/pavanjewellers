require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const twilio = require('twilio');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'pavan_jewellers_secret_key_2026';

// Middleware
app.use(cors());
app.use(express.json());

// Supabase Setup
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
let supabase = null;

if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project') && !supabaseKey.includes('your-supabase-key')) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase client initialized with secret/anon key.');
} else {
  console.log('⚠️ Supabase credentials not provided or default. Running in mock DB storage mode.');
}

// Storage
const memoryShops = [];
const memoryOTPs = new Map(); // mobile -> { otp, expiresAt, verified }

// Twilio Setup
let twilioClient = null;
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

if (accountSid && authToken && accountSid.startsWith('AC')) {
  twilioClient = twilio(accountSid, authToken);
  console.log('✅ Twilio client initialized.');
} else {
  console.log('⚠️ Twilio credentials not fully set. Running with Dev OTP fallback (OTP: 123456).');
}

// Format Phone Number for Twilio (E.164)
const formatPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) return `+91${cleaned}`;
  if (phone.startsWith('+')) return phone;
  return `+${cleaned}`;
};

// ==================== ROUTES ====================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Pavan Jewellers Girvi API',
    supabaseConnected: !!supabase,
    twilioConnected: !!twilioClient
  });
});

// 1. STEP 1: Send Twilio OTP (Registration Mobile)
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { reg_mobile } = req.body;

    if (!reg_mobile || reg_mobile.replace(/\D/g, '').length < 10) {
      return res.status(400).json({ error: 'Valid 10-digit registration mobile number is required' });
    }

    const formattedMobile = formatPhone(reg_mobile);

    // Option A: Twilio Verify API
    if (twilioClient && verifyServiceSid) {
      try {
        const verification = await twilioClient.verify.v2
          .services(verifyServiceSid)
          .verifications.create({ to: formattedMobile, channel: 'sms' });

        return res.json({
          success: true,
          message: `Real Twilio OTP sent to ${reg_mobile}`,
          status: verification.status,
          isMock: false
        });
      } catch (err) {
        console.error('Twilio Verify error:', err.message);
        return res.status(400).json({ error: `Twilio Error: ${err.message}` });
      }
    }

    // Option B: Twilio Standard SMS or Development Mode
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins

    memoryOTPs.set(reg_mobile.replace(/\D/g, ''), {
      otp: generatedOtp,
      expiresAt,
      verified: false
    });

    if (twilioClient && twilioNumber) {
      try {
        await twilioClient.messages.create({
          body: `[Pavan Jewellers] Your registration OTP is ${generatedOtp}. Valid for 5 minutes.`,
          from: twilioNumber,
          to: formattedMobile
        });
        return res.json({
          success: true,
          message: `OTP SMS sent via Twilio to ${reg_mobile}`,
          isMock: false
        });
      } catch (err) {
        console.error('Twilio SMS error:', err.message);
      }
    }

    // Development/Fallback Mode
    console.log(`\n========================================`);
    console.log(`🔑 DEV OTP for ${reg_mobile}: [ ${generatedOtp} ] (or use 123456)`);
    console.log(`========================================\n`);

    return res.json({
      success: true,
      message: `OTP generated for ${reg_mobile}. (Development mode OTP: 123456 or ${generatedOtp})`,
      devOtp: generatedOtp,
      isMock: true
    });

  } catch (error) {
    console.error('Send OTP Error:', error);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// 2. STEP 2: Verify Twilio OTP
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { reg_mobile, otp } = req.body;

    if (!reg_mobile || !otp) {
      return res.status(400).json({ error: 'Mobile number and OTP are required' });
    }

    const formattedMobile = formatPhone(reg_mobile);
    const cleanedMobile = reg_mobile.replace(/\D/g, '');

    // Option A: Twilio Verify Check
    if (twilioClient && verifyServiceSid) {
      try {
        const check = await twilioClient.verify.v2
          .services(verifyServiceSid)
          .verificationChecks.create({ to: formattedMobile, code: otp });

        if (check.status === 'approved') {
          memoryOTPs.set(cleanedMobile, { otp, verified: true, expiresAt: Date.now() + 600000 });
          return res.json({ success: true, message: 'OTP verified via Twilio' });
        } else {
          return res.status(400).json({ error: 'Incorrect Twilio OTP code entered. Please check your SMS.' });
        }
      } catch (err) {
        console.error('Twilio Verification check error:', err.message);
        return res.status(400).json({ error: `Twilio Verification Error: ${err.message}` });
      }
    }

    // Dev mode universal OTP fallback only if Twilio Verify is not active
    if (otp === '123456') {
      memoryOTPs.set(cleanedMobile, { otp: '123456', verified: true, expiresAt: Date.now() + 600000 });
      return res.json({ success: true, message: 'OTP verified successfully (Dev mode)' });
    }

    // Option B: Memory check
    const record = memoryOTPs.get(cleanedMobile);
    if (!record) {
      return res.status(400).json({ error: 'OTP expired or not requested. Please request a new OTP.' });
    }

    if (Date.now() > record.expiresAt) {
      memoryOTPs.delete(cleanedMobile);
      return res.status(400).json({ error: 'OTP has expired. Please request a new OTP.' });
    }

    if (record.otp === otp) {
      record.verified = true;
      memoryOTPs.set(cleanedMobile, record);
      return res.json({ success: true, message: 'OTP verified successfully' });
    } else {
      return res.status(400).json({ error: 'Invalid OTP code. Please check and try again.' });
    }

  } catch (error) {
    console.error('Verify OTP Error:', error);
    return res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// 3. STEP 3: Complete Shop Registration
app.post('/api/auth/register-shop', async (req, res) => {
  try {
    const { reg_mobile, shop_name, login_mobile, pin, address } = req.body;

    if (!reg_mobile || !shop_name || !login_mobile || !pin) {
      return res.status(400).json({ error: 'Please provide shop name, login mobile number, and security PIN' });
    }

    const cleanedRegMobile = reg_mobile.replace(/\D/g, '');
    const cleanedLoginMobile = login_mobile.replace(/\D/g, '');

    // Check OTP verification status
    const otpRecord = memoryOTPs.get(cleanedRegMobile);
    if (process.env.NODE_ENV !== 'development' && (!otpRecord || !otpRecord.verified)) {
      return res.status(400).json({ error: 'Registration phone number must be verified via OTP first' });
    }

    // Hash the login PIN
    const pin_hash = await bcrypt.hash(pin.toString(), 10);

    // If Supabase is connected, store in Supabase
    if (supabase) {
      // Check if login mobile already exists
      const { data: existingShop } = await supabase
        .from('shops')
        .select('id')
        .eq('login_mobile', cleanedLoginMobile)
        .single();

      if (existingShop) {
        return res.status(400).json({ error: 'A shop with this Login Mobile Number is already registered.' });
      }

      const { data: newShop, error: insertError } = await supabase
        .from('shops')
        .insert([
          {
            shop_name,
            login_mobile: cleanedLoginMobile,
            reg_mobile: cleanedRegMobile,
            pin_hash,
            address: address || '',
            is_verified: true
          }
        ])
        .select()
        .single();

      if (insertError) {
        console.error('Supabase Insert Error:', insertError);
        if (insertError.message && insertError.message.includes('schema cache')) {
          return res.status(400).json({ error: "Supabase table 'shops' not found. Please run the SQL script in your Supabase SQL Editor to create the table." });
        }
        return res.status(400).json({ error: insertError.message || 'Error registering shop in Supabase' });
      }

      const token = jwt.sign({ shopId: newShop.id, loginMobile: newShop.login_mobile }, JWT_SECRET, { expiresIn: '7d' });

      return res.json({
        success: true,
        message: 'Shop registered successfully!',
        shop: {
          id: newShop.id,
          shop_name: newShop.shop_name,
          login_mobile: newShop.login_mobile,
          address: newShop.address
        },
        token
      });
    }

    // In-memory fallback
    const exists = memoryShops.find(s => s.login_mobile === cleanedLoginMobile);
    if (exists) {
      return res.status(400).json({ error: 'A shop with this Login Mobile Number is already registered.' });
    }

    const shopObj = {
      id: `shop-${Date.now()}`,
      shop_name,
      login_mobile: cleanedLoginMobile,
      reg_mobile: cleanedRegMobile,
      pin_hash,
      address: address || '',
      created_at: new Date().toISOString()
    };

    memoryShops.push(shopObj);

    const token = jwt.sign({ shopId: shopObj.id, loginMobile: shopObj.login_mobile }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      success: true,
      message: 'Shop registered successfully!',
      shop: {
        id: shopObj.id,
        shop_name: shopObj.shop_name,
        login_mobile: shopObj.login_mobile,
        address: shopObj.address
      },
      token
    });

  } catch (error) {
    console.error('Register Shop Error:', error);
    return res.status(500).json({ error: 'Internal server error during shop registration' });
  }
});

// 4. LOGIN: Shop Login using Mobile Number + PIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { login_mobile, pin } = req.body;

    if (!login_mobile || !pin) {
      return res.status(400).json({ error: 'Mobile number and PIN are required for login' });
    }

    const cleanedLoginMobile = login_mobile.replace(/\D/g, '');

    let shopData = null;

    // Check Supabase if connected
    if (supabase) {
      const { data, error } = await supabase
        .from('shops')
        .select('id, shop_name, login_mobile, reg_mobile, pin_hash, address')
        .eq('login_mobile', cleanedLoginMobile)
        .maybeSingle();

      if (!error && data) {
        shopData = data;
      }
    }

    // Check memory fallback if not found in Supabase
    if (!shopData) {
      shopData = memoryShops.find(s => s.login_mobile === cleanedLoginMobile);
    }

    if (!shopData) {
      return res.status(404).json({ error: 'No shop found with this login mobile number. Please register your shop first.' });
    }

    // Compare PIN
    const isMatch = await bcrypt.compare(pin.toString(), shopData.pin_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect PIN. Please check and try again.' });
    }

    const token = jwt.sign({ shopId: shopData.id, loginMobile: shopData.login_mobile }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      success: true,
      message: 'Login successful!',
      shop: {
        id: shopData.id,
        shop_name: shopData.shop_name,
        login_mobile: shopData.login_mobile,
        reg_mobile: shopData.reg_mobile,
        address: shopData.address
      },
      token
    });

  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
});

// 5. GIRVI SYNC ENDPOINTS (Ultra-fast sync)
app.get('/api/girvis/:shopId', async (req, res) => {
  try {
    const { shopId } = req.params;
    if (supabase) {
      const { data, error } = await supabase
        .from('girvis')
        .select('*')
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return res.json({ success: true, girvis: data.map(d => d.data || d) });
      }
    }
    return res.json({ success: true, girvis: [] });
  } catch (err) {
    return res.json({ success: true, girvis: [] });
  }
});

app.post('/api/girvis', async (req, res) => {
  try {
    const { shopId, girvi } = req.body;
    if (supabase && shopId && girvi) {
      await supabase.from('girvis').upsert([{
        id: girvi.id,
        shop_id: shopId,
        data: girvi,
        status: girvi.status || 'ACTIVE',
        metal: girvi.metal || 'Gold',
        updated_at: new Date().toISOString()
      }]);
    }
    return res.json({ success: true });
  } catch (err) {
    return res.json({ success: true });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Pavan Jewellers Backend server running on http://localhost:${PORT}`);
});
