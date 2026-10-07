const { getFirestore } = require('../config/firebase-admin');

/**
 * Handle Google Auth verification with Sign Up vs Login distinction
 */
async function verifyUser(req, res) {
  try {
    const { uid, email, name, picture } = req.user;
    const { authType } = req.body; // 'signup' or 'login'

    const db = getFirestore();
    let userDocRef = db.collection('users').doc(uid);
    let userDoc = await userDocRef.get();

    // Check by email in case account was created with email or across project sync
    if (!userDoc.exists && email) {
      const emailQuery = await db.collection('users').where('email', '==', email).limit(1).get();
      if (!emailQuery.empty) {
        userDoc = emailQuery.docs[0];
        userDocRef = db.collection('users').doc(userDoc.id);
      }
    }

    // AUTO-DETECT: Check whether user already exists in Firestore
    if (userDoc.exists) {
      // Existing User -> check if profile is completed
      const userData = userDoc.data() || {};
      const isProfileDone = userData.profileCompleted === true;
      const redirectTo = isProfileDone ? 'dashboard.html' : 'profile-setup.html';

      // Update last active time & sync avatar/name
      await userDocRef.set({
        lastLoginAt: new Date().toISOString(),
        fullName: userData.fullName || name || '',
        avatar: userData.avatar || picture || '',
        email: userData.email || email || ''
      }, { merge: true });

      return res.status(200).json({
        success: true,
        isNewUser: false,
        message: 'Welcome back! Logged in successfully.',
        user: { ...userData, id: userDoc.id },
        redirectTo
      });
    } else {
      // New User -> Automatically create application profile and direct to profile completion
      const newUserData = {
        firebaseUid: uid,
        email: email || '',
        fullName: name || '',
        avatar: picture || '',
        phone: '',
        address: '',
        designation: '',
        githubUrl: '',
        linkedinUrl: '',
        portfolioUrl: '',
        profileCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };

      await userDocRef.set(newUserData);

      return res.status(201).json({
        success: true,
        isNewUser: true,
        message: 'Account created successfully! Welcome to Smart Resume Ranker.',
        user: newUserData,
        redirectTo: 'profile-setup.html'
      });
    }
  } catch (error) {
    console.error('Verify user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify account: ' + error.message
    });
  }
}

/**
 * Get User Profile
 */
async function getUserProfile(req, res) {
  try {
    const { uid } = req.user;
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    return res.status(200).json({
      success: true,
      user: userDoc.data()
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile: ' + error.message
    });
  }
}

/**
 * Update User Profile
 */
async function updateUserProfile(req, res) {
  try {
    const { uid } = req.user;
    const {
      fullName,
      phone,
      address,
      designation,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
      profileCompleted
    } = req.body;

    const db = getFirestore();
    const userDocRef = db.collection('users').doc(uid);
    const existing = await userDocRef.get();

    const updatedData = {
      fullName: fullName !== undefined ? fullName : (existing.exists ? existing.data().fullName : ''),
      phone: phone !== undefined ? phone : (existing.exists ? existing.data().phone : ''),
      address: address !== undefined ? address : (existing.exists ? existing.data().address : ''),
      designation: designation !== undefined ? designation : (existing.exists ? existing.data().designation : ''),
      githubUrl: githubUrl !== undefined ? githubUrl : (existing.exists ? existing.data().githubUrl : ''),
      linkedinUrl: linkedinUrl !== undefined ? linkedinUrl : (existing.exists ? existing.data().linkedinUrl : ''),
      portfolioUrl: portfolioUrl !== undefined ? portfolioUrl : (existing.exists ? existing.data().portfolioUrl : ''),
      profileCompleted: profileCompleted !== undefined ? Boolean(profileCompleted) : true,
      updatedAt: new Date().toISOString()
    };

    await userDocRef.set(updatedData, { merge: true });

    const finalDoc = await userDocRef.get();
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: finalDoc.data()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user profile: ' + error.message
    });
  }
}

module.exports = {
  verifyUser,
  getUserProfile,
  updateUserProfile
};
