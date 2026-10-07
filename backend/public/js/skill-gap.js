// Smart Resume Ranker - Skill Gap Analysis Logic

let availableRoles = [];
let userExtractedSkills = [];

async function initSkillGap() {
  await loadRolesCatalog();
  await loadUserCurrentSkills();
  setupRoleSearchAndSelect();
}

/**
 * Load tech roles catalog from backend
 */
async function loadRolesCatalog() {
  try {
    const res = await apiRequest('/skills/roles');
    if (res && res.roles) {
      availableRoles = res.roles;
      renderRoleDropdown(availableRoles);
    }
  } catch (err) {
    console.error('Failed to load roles catalog:', err);
  }
}

/**
 * Load user's skills from latest analyzed resume
 */
async function loadUserCurrentSkills() {
  try {
    const res = await apiRequest('/resume/latest');
    if (res && res.data && res.data.technicalSkills) {
      userExtractedSkills = res.data.technicalSkills;
      const skillsInput = document.getElementById('user-skills-input');
      if (skillsInput) skillsInput.value = userExtractedSkills.join(', ');
    }
  } catch (err) {
    console.warn('No existing resume skills found:', err.message);
  }
}

function renderRoleDropdown(roles) {
  const select = document.getElementById('target-role-select');
  if (!select) return;

  select.innerHTML = roles.map(r => `
    <option value="${r.id}">${r.title} (${r.category})</option>
  `).join('');
}

function setupRoleSearchAndSelect() {
  const searchInput = document.getElementById('role-search-input');
  const select = document.getElementById('target-role-select');
  const analyzeBtn = document.getElementById('btn-analyze-gap');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const filtered = availableRoles.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.requiredSkills.some(s => s.toLowerCase().includes(q))
      );
      renderRoleDropdown(filtered.length > 0 ? filtered : availableRoles);
    });
  }

  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', runSkillGapAnalysis);
  }
}

async function runSkillGapAnalysis() {
  const select = document.getElementById('target-role-select');
  const skillsInput = document.getElementById('user-skills-input');
  const customRoleInput = document.getElementById('custom-role-input');
  const analyzeBtn = document.getElementById('btn-analyze-gap');
  const resultsContainer = document.getElementById('gap-results-container');

  const targetRoleId = select ? select.value : '';
  const customTargetRole = customRoleInput ? customRoleInput.value.trim() : '';

  let skills = [];
  if (skillsInput && skillsInput.value.trim()) {
    skills = skillsInput.value.split(',').map(s => s.trim()).filter(Boolean);
  } else {
    skills = userExtractedSkills;
  }

  if (analyzeBtn) {
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<span class="spinner"></span> Analyzing Skill Match...';
  }

  try {
    const res = await apiRequest('/skills/analyze', {
      method: 'POST',
      body: JSON.stringify({
        targetRoleId,
        customTargetRole,
        userSkills: skills
      })
    });

    if (res.success && res.data) {
      showToast('Skill gap analysis completed!', 'success');
      renderGapResults(res.data);
    }
  } catch (error) {
    console.error('Gap analysis error:', error);
    showToast('Failed to analyze skill gap: ' + error.message, 'error');
  } finally {
    if (analyzeBtn) {
      analyzeBtn.disabled = false;
      analyzeBtn.innerHTML = '🔍 Analyze Skill Gap';
    }
  }
}

function renderGapResults(data) {
  const container = document.getElementById('gap-results-container');
  if (!container) return;

  container.style.display = 'block';
  container.scrollIntoView({ behavior: 'smooth' });

  // Match Percentage
  const matchElem = document.getElementById('gap-match-percentage');
  if (matchElem) matchElem.textContent = `${data.matchPercentage}%`;

  const roleTitleElem = document.getElementById('gap-role-title');
  if (roleTitleElem) roleTitleElem.textContent = data.targetRole.title;

  const roleDescElem = document.getElementById('gap-role-desc');
  if (roleDescElem) roleDescElem.textContent = data.targetRole.description;

  // Skills You Have
  const haveContainer = document.getElementById('skills-you-have-list');
  if (haveContainer) {
    haveContainer.innerHTML = (data.skillsYouHave || []).map(s => `
      <span class="skill-tag have">✓ ${s}</span>
    `).join('') || '<span class="text-muted">None detected. Add skills to see matches.</span>';
  }

  // Missing High Priority
  const highContainer = document.getElementById('missing-high-priority');
  if (highContainer) {
    const list = data.missingSkills.highPriority || [];
    highContainer.innerHTML = list.length > 0
      ? list.map(s => `<span class="skill-tag missing-high">🔥 ${s}</span>`).join('')
      : '<span class="text-muted">No high priority gaps! You meet core essentials.</span>';
  }

  // Missing Medium Priority
  const medContainer = document.getElementById('missing-medium-priority');
  if (medContainer) {
    const list = data.missingSkills.mediumPriority || [];
    medContainer.innerHTML = list.length > 0
      ? list.map(s => `<span class="skill-tag missing-med">⚡ ${s}</span>`).join('')
      : '<span class="text-muted">No medium priority gaps.</span>';
  }

  // Missing Low Priority
  const lowContainer = document.getElementById('missing-low-priority');
  if (lowContainer) {
    const list = data.missingSkills.lowPriority || [];
    lowContainer.innerHTML = list.length > 0
      ? list.map(s => `<span class="skill-tag">💡 ${s}</span>`).join('')
      : '<span class="text-muted">None</span>';
  }

  // Recommendations
  const recContainer = document.getElementById('gap-recommendations-list');
  if (recContainer) {
    recContainer.innerHTML = (data.recommendations || []).map(r => `<li>${r}</li>`).join('');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initSkillGap();
});
