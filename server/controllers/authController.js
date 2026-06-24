const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const { sanitize, sanitizeFields } = require('../utils/sanitize');

const buildAddress = (address = {}) => ({
  street: address.street || address.addressLine || '',
  city: address.city || '',
  postalCode: address.postalCode || ''
});

const userResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  profileType: user.profileType,
  schoolLevel: user.schoolLevel,
  wilaya: user.wilaya,
  address: buildAddress(user.address),
  avatar: user.avatar,
  isPro: user.isPro,
  role: user.role,
  isBanned: user.isBanned,
  subscriptionActive: user.subscriptionActive
});

/**
 * @desc    Register a new student/user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  try {
    let { name, email, phone, password, profileType, schoolLevel, wilaya, address } = req.body;
    sanitizeFields(req.body, ['name', 'email', 'phone', 'schoolLevel', 'wilaya']);

    if (!name || !email || !phone || !password || !profileType || !wilaya || !address?.street) {
      return res.status(400).json({ 
        success: false, 
        message: 'Veuillez remplir tous les champs obligatoires' 
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cet utilisateur existe déjà' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '';

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      profileType: profileType || '',
      schoolLevel: schoolLevel || '',
      wilaya: wilaya || '',
      address: buildAddress(address),
      ip: clientIp
    });

    if (user) {
      res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: userResponse(user)
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Données utilisateur invalides' 
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Authenticate user and get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Veuillez fournir un email et un mot de passe' 
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Identifiants invalides' 
      });
    }

    // Check password
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'Compte lié à Google, connectez-vous via Google'
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Identifiants invalides' 
      });
    }

    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '';
    if (clientIp && !user.ip) {
      user.ip = clientIp;
      await user.save();
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: userResponse(user)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get user profile data
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      user: userResponse(req.user)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la connexion' });
  }
};

/**
 * @desc    Send verification OTP to email
 * @route   POST /api/auth/send-verification
 * @access  Public
 */
const sendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email requis' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    if (user.emailVerified) {
      return res.status(400).json({ success: false, message: 'Email déjà vérifié' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationOTP = otp;
    user.verificationOTPExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail({
      to: email,
      subject: 'Code de vérification Linkbook',
      html: `
        <div style="font-family: Arial; max-width: 480px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2777df;">Vérification de votre email</h2>
          <p>Votre code de vérification :</p>
          <div style="font-size: 36px; font-weight: 900; letter-spacing: 8px; text-align: center; color: #2777df; padding: 20px; background: #f0f5ff; border-radius: 12px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #666;">Ce code expire dans 10 minutes.</p>
          <p style="color: #999; font-size: 12px;">Linkbook — Plateforme Tunisienne de Troc de Livres</p>
        </div>
      `,
    });

    res.json({ success: true, message: 'Code de vérification envoyé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Verify email with OTP
 * @route   POST /api/auth/verify-email
 * @access  Public
 */
const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email et code requis' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    if (user.emailVerified) {
      return res.json({ success: true, message: 'Email déjà vérifié' });
    }
    if (user.verificationOTP !== otp) {
      return res.status(400).json({ success: false, message: 'Code invalide' });
    }
    if (Date.now() > user.verificationOTPExpires) {
      return res.status(400).json({ success: false, message: 'Code expiré' });
    }

    user.emailVerified = true;
    user.verificationOTP = null;
    user.verificationOTPExpires = null;
    await user.save();

    res.json({ success: true, message: 'Email vérifié avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Send password reset link
 * @route   POST /api/auth/forgot
 * @access  Public
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email requis' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ success: true, message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000;
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/#reset-password?token=${resetToken}`;

    await sendEmail({
      to: email,
      subject: 'Réinitialisation de mot de passe Linkbook',
      html: `
        <div style="font-family: Arial; max-width: 480px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2777df;">Réinitialisation de mot de passe</h2>
          <p>Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe :</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; background: #2777df; color: white; text-decoration: none; border-radius: 12px; font-weight: bold; margin: 20px 0;">
            Réinitialiser mon mot de passe
          </a>
          <p style="color: #666;">Ce lien expire dans 30 minutes.</p>
          <p style="color: #999; font-size: 12px;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
          <p style="color: #999; font-size: 12px;">Linkbook — Plateforme Tunisienne de Troc de Livres</p>
        </div>
      `,
    });

    res.json({
      success: true,
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de l\'envoi de l\'email' });
  }
};

/**
 * @desc    Reset password with token
 * @route   POST /api/auth/reset/:token
 * @access  Public
 */
const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: 'Mot de passe requis' });
    }

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Token invalide ou expiré' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ success: true, message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    let { name, phone, profileType, schoolLevel, wilaya, address, avatar } = req.body;
    sanitizeFields(req.body, ['name', 'phone', 'schoolLevel', 'wilaya']);
    const user = await User.findById(req.user._id);

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (profileType !== undefined) user.profileType = profileType;
    if (schoolLevel !== undefined) user.schoolLevel = schoolLevel;
    if (wilaya !== undefined) user.wilaya = wilaya;
    if (address !== undefined) user.address = buildAddress(address);
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      user: userResponse(user)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    let { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Veuillez fournir l\'ancien et le nouveau mot de passe' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    const user = await User.findById(req.user._id);

    if (!user.password) {
      return res.status(400).json({ success: false, message: 'Compte lié à Google, pas de mot de passe' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Mot de passe actuel incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  sendVerification,
  verifyEmail,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
};
