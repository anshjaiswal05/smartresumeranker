// Smart Resume Ranker - Profile Page Logic

async function initProfilePage() {
  await loadUserProfile();
  await loadStructuredResumeDetails();
  bindProfileForm();
}

/**
 * Load user account profile
 */
async function loadUserProfile() {
  try {
    const res = await apiRequest('/user/profile');
    if (res && res.user) {
      const u = res.user;

      // Personal Details
      setVal('profile-name', u.fullName);
      setVal('profile-email', u.email);
      setVal('profile-phone', u.phone);
      setVal('profile-address', u.address);
      setVal('profile-designation', u.designation);

      // Online links
      setVal('profile-github', u.githubUrl);
      setVal('profile-linkedin', u.linkedinUrl);
      setVal('profile-portfolio', u.portfolioUrl);

      // Display cards
      const dispName = document.getElementById('disp-profile-name');
      if (dispName) dispName.textContent = u.fullName || 'User Profile';

      const dispDesig = document.getElementById('disp-profile-designation');
      if (dispDesig) dispDesig.textContent = u.designation || 'Software Professional';

      const dispEmail = document.getElementById('disp-profile-email');
      if (dispEmail) dispEmail.textContent = u.email || '';

      const avatar = document.getElementById('profile-avatar-circle');
      if (avatar) {
        const initials = (u.fullName || 'SR').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        avatar.textContent = initials;
      }
    }
  } catch (error) {
    console.warn('Failed to load profile from backend, using cached session:', error);
    try {
      const u = JSON.parse(localStorage.getItem('srr_user') || '{}');
      if (u.name || u.fullName || u.email) {
        setVal('profile-name', u.fullName || u.name || '');
        setVal('profile-email', u.email || '');
        setVal('profile-phone', u.phone || '');
        setVal('profile-address', u.address || '');
        setVal('profile-designation', u.designation || '');
        setVal('profile-github', u.githubUrl || '');
        setVal('profile-linkedin', u.linkedinUrl || '');
        setVal('profile-portfolio', u.portfolioUrl || '');

        const dispName = document.getElementById('disp-profile-name');
        if (dispName) dispName.textContent = u.fullName || u.name || 'User Profile';
        const dispDesig = document.getElementById('disp-profile-designation');
        if (dispDesig) dispDesig.textContent = u.designation || 'Software Professional';
        const dispEmail = document.getElementById('disp-profile-email');
        if (dispEmail) dispEmail.textContent = u.email || '';
        const avatar = document.getElementById('profile-avatar-circle');
        if (avatar) {
          const initials = ((u.fullName || u.name || 'SR')).split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
          avatar.textContent = initials;
        }
      }
    } catch (e) {}
  }
}

/**
 * Load structured resume information from latest analysis
 */
async function loadStructuredResumeDetails() {
  const container = document.getElementById('profile-resume-details');
  if (!container) return;

  try {
    const res = await apiRequest('/resume/latest');
    if (res && res.data) {
      const d = res.data;

      const atsBadge = document.getElementById('profile-ats-badge');
      if (atsBadge) atsBadge.textContent = `${d.atsScore} / 100 ATS Score`;

      const summaryText = document.getElementById('profile-resume-summary');
      if (summaryText) summaryText.textContent = d.professionalSummary || 'No summary detected.';

      const skillsBox = document.getElementById('profile-extracted-skills');
      if (skillsBox) {
        skillsBox.innerHTML = (d.technicalSkills || []).map(s => `<span class="skill-tag have">${s}</span>`).join('') || '<span class="text-muted">No skills detected</span>';
      }

      const recsList = document.getElementById('profile-recommendations-list');
      if (recsList) {
        recsList.innerHTML = (d.recommendations || []).map(r => `<li>${r}</li>`).join('');
      }
    } else {
      container.innerHTML = `
        <div style="text-align:center;padding:24px;color:var(--text-muted);">
          <p>No resume analyzed yet.</p>
          <a href="resume.html" class="btn btn-primary" style="margin-top:12px;">📄 Upload & Analyze Resume</a>
        </div>
      `;
    }
  } catch (err) {
    console.warn('Failed to load resume details:', err.message);
  }
}

function bindProfileForm() {
  const saveBtn = document.getElementById('btn-save-profile');
  if (saveBtn) {
    saveBtn.addEventListener('click', saveProfileChanges);
  }
}

async function saveProfileChanges() {
  const saveBtn = document.getElementById('btn-save-profile');
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="spinner"></span> Saving...';
  }

  const payload = {
    fullName: getVal('profile-name'),
    phone: getVal('profile-phone'),
    address: getVal('profile-address'),
    designation: getVal('profile-designation'),
    githubUrl: getVal('profile-github'),
    linkedinUrl: getVal('profile-linkedin'),
    portfolioUrl: getVal('profile-portfolio'),
    profileCompleted: true
  };

  try {
    const res = await apiRequest('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });

    if (res.success) {
      showToast('Profile updated successfully!', 'success');
      await loadUserProfile();
    }
  } catch (error) {
    console.error('Update profile error:', error);
    showToast('Failed to save profile: ' + error.message, 'error');
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '💾 Save Profile Details';
    }
  }
}

function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || '';
}

document.addEventListener('DOMContentLoaded', () => {
  initProfilePage();
});
