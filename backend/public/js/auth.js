// Smart Resume Ranker - Unified Google Authentication Logic
// Automatically detects whether a user is NEW (routes to profile-setup.html)
// or an EXISTING user (routes directly to dashboard.html).

/**
 * Core Unified Google Authentication Handler
 * @param {Event|HTMLElement} trigger - The event or button triggering the sign-in
 */
async function handleGoogleAuth(trigger) {
  let btn = null;
  if (trigger instanceof HTMLElement) {
    btn = trigger;
  } else if (trigger && trigger.currentTarget instanceof HTMLElement) {
    btn = trigger.currentTarget;
  } else {
    btn = document.getElementById('btn-google-auth') ||
          document.getElementById('btn-google-login') ||
          document.getElementById('btn-google-signup');
  }

  const alertBox = document.getElementById('auth-alert');
  if (alertBox) {
    alertBox.style.display = 'none';
    alertBox.textContent = '';
  }

  const originalBtnHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Connecting to Google...';
  }

  try {
    let idToken = null;
    let userProfile = null;

    if (window.isFirebaseClientReady && window.isFirebaseClientReady() && typeof firebase !== 'undefined' && firebase.auth) {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await firebase.auth().signInWithPopup(provider);
      idToken = await result.user.getIdToken();
      userProfile = {
        uid: result.user.uid,
        email: result.user.email,
        name: result.user.displayName,
        picture: result.user.photoURL
      };
    } else {
      // Local development simulation mode
      const devUid = 'user_' + (localStorage.getItem('srr_demo_uid') || Date.now());
      localStorage.setItem('srr_demo_uid', devUid);
      idToken = `dev_token_${devUid}`;
      userProfile = {
        uid: devUid,
        email: `${devUid}@gmail.com`,
        name: 'Alex Developer',
        picture: ''
      };
    }

    // Save tokens in storage
    localStorage.setItem('srr_auth_token', idToken);
    localStorage.setItem('srr_user', JSON.stringify(userProfile));

    if (btn) {
      btn.innerHTML = '<span class="spinner"></span> Verifying account...';
    }

    // Auto-detect via backend API
    const response = await apiRequest('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({
        authType: 'auto'
      })
    });

    if (response && response.success) {
      // Sync profile completion flag
      if (response.user && response.user.profileCompleted) {
        localStorage.setItem('srr_profile_completed', 'true');
      }

      if (response.user) {
        localStorage.setItem('srr_user', JSON.stringify({
          ...userProfile,
          ...response.user
        }));
      }

      // Check auto-detection outcome:
      // If user is new OR their profile is not yet completed -> profile-setup.html
      // If user exists with completed profile -> dashboard.html
      const isNew = response.isNewUser === true || response.redirectTo === 'profile-setup.html';

      if (isNew) {
        showToast('Welcome to Smart Resume Ranker! Let\'s set up your profile.', 'success');
        setTimeout(() => {
          window.location.href = response.redirectTo || 'profile-setup.html';
        }, 700);
      } else {
        const displayName = (response.user && response.user.fullName) || userProfile.name || 'User';
        showToast(`Welcome back, ${displayName}! Opening dashboard...`, 'success');
        setTimeout(() => {
          window.location.href = response.redirectTo || 'dashboard.html';
        }, 700);
      }
      return;
    }

    throw new Error((response && response.message) || 'Authentication failed. Please try again.');

  } catch (error) {
    console.error('Unified Google Auth error:', error);
    let msg = error.message || 'Authentication failed. Please try again.';

    if (error.code === 'auth/popup-closed-by-user') {
      msg = 'Sign in was cancelled (Google window was closed).';
    } else if (error.code === 'auth/popup-blocked') {
      msg = 'Google popup was blocked by your browser. Please allow popups for this site.';
    } else if (error.code === 'auth/cancelled-popup-request') {
      msg = 'Only one sign-in window can be active at a time.';
    } else if (error.code === 'auth/operation-not-allowed') {
      msg = 'Google Sign-In is not enabled in Firebase Console. Please verify Authentication settings.';
    }

    if (alertBox) {
      alertBox.textContent = msg;
      alertBox.style.display = 'block';
      alertBox.className = 'alert alert-danger';
    } else {
      showToast(msg, 'error');
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalBtnHtml || '<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style="width:20px;height:20px;margin-right:10px;vertical-align:middle;"> Continue with Google';
    }
  }
}

// Aliases for full backwards compatibility
const handleGoogleLogin = handleGoogleAuth;
const handleGoogleSignUp = handleGoogleAuth;

/**
 * Handle Logout
 */
async function handleLogout() {
  try {
    if (typeof firebase !== 'undefined' && firebase.auth) {
      await firebase.auth().signOut().catch(() => {});
    }
  } catch (e) {}

  localStorage.removeItem('srr_auth_token');
  localStorage.removeItem('srr_user');
  localStorage.removeItem('srr_profile_completed');
  sessionStorage.clear();
  window.location.href = 'index.html';
}

/**
 * Auth Guard for Protected Pages (Compatible with cleanUrls and .html)
 */
function checkAuthGuard() {
  const rawPath = window.location.pathname.toLowerCase();
  const path = rawPath.endsWith('/') && rawPath.length > 1 ? rawPath.slice(0, -1) : rawPath;
  const pageName = path.split('/').pop() || '';

  // Determine if current page is public
  const isPublic = 
    path === '/' ||
    path === '' ||
    pageName === '' ||
    pageName === 'index' ||
    pageName === 'index.html' ||
    pageName === 'login' ||
    pageName === 'login.html' ||
    pageName === 'signup' ||
    pageName === 'signup.html';

  if (isPublic) {
    // Never redirect if already on login, signup, or home
    return;
  }

  const token = localStorage.getItem('srr_auth_token');
  if (!token) {
    window.location.href = 'login.html';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Bind unified Google Auth to all auth trigger buttons
  const authButtons = document.querySelectorAll('#btn-google-auth, #btn-google-login, #btn-google-signup, .btn-google-auth');
  authButtons.forEach(btn => {
    btn.addEventListener('click', (e) => handleGoogleAuth(e));
  });

  const logoutBtns = document.querySelectorAll('.btn-logout, #btn-logout');
  logoutBtns.forEach(b => b.addEventListener('click', handleLogout));

  checkAuthGuard();
});

// Expose globally
window.handleGoogleAuth = handleGoogleAuth;
window.handleGoogleLogin = handleGoogleAuth;
window.handleGoogleSignUp = handleGoogleAuth;
window.handleLogout = handleLogout;
