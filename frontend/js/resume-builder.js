// Smart Resume Ranker - Interactive Resume Builder Logic

let resumeState = {
  template: 'modern',
  personalInfo: {
    fullName: 'Alex Developer',
    email: 'alex.developer@example.com',
    phone: '+91 98765 43210',
    address: 'Bengaluru, India',
    designation: 'Senior Full Stack Engineer',
    githubUrl: 'https://github.com/alexdev',
    linkedinUrl: 'https://linkedin.com/in/alexdev',
    portfolioUrl: 'https://alexdev.io'
  },
  summary: 'Results-driven software engineer with extensive experience developing scalable web applications, RESTful microservices, and high-performance cloud architectures. Proven record of enhancing system reliability and accelerating feature delivery.',
  experience: [
    {
      id: 'exp-1',
      role: 'Full Stack Engineer',
      company: 'Innovatech Labs',
      location: 'Bengaluru, India',
      startDate: '2022',
      endDate: 'Present',
      description: 'Architected microservices handling 2M+ requests daily using Node.js and Redis. Refactored React frontend resulting in 40% reduction in initial bundle size.'
    }
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'B.Tech in Computer Science',
      institution: 'National Institute of Technology',
      location: 'India',
      year: '2022',
      score: '8.6 CGPA'
    }
  ],
  skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'PostgreSQL', 'Docker', 'AWS', 'Git', 'REST APIs'],
  projects: [
    {
      id: 'proj-1',
      title: 'Smart Resume Ranker Platform',
      technologies: 'Node.js, Express, Firebase, Gemini AI',
      link: 'https://github.com/alexdev/smart-resume-ranker',
      description: 'Engineered an automated career preparation platform providing deterministic ATS scoring, skill gap detection, and AI interview simulations.'
    }
  ],
  certifications: [
    { id: 'cert-1', name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', year: '2024' }
  ],
  achievements: [
    { id: 'ach-1', text: 'Awarded Engineering Excellence Award for delivering zero-downtime database migration.' }
  ],
  languages: ['English (Fluent)', 'Hindi (Native)']
};

/**
 * Initialize Builder
 */
async function initResumeBuilder() {
  await loadSavedResumeData();
  bindFormInputs();
  bindTemplateSelector();
  bindDynamicSectionButtons();
  renderFormLists();
  updateLivePreview();
}

/**
 * Load saved resume data from backend
 */
async function loadSavedResumeData() {
  try {
    const res = await apiRequest('/resume-builder');
    if (res && res.data) {
      resumeState = { ...resumeState, ...res.data };
      populateFormFields();
    }
  } catch (err) {
    console.warn('Could not load saved resume builder state:', err.message);
  }
}

/**
 * Populate standard form inputs from state
 */
function populateFormFields() {
  const p = resumeState.personalInfo || {};
  setVal('input-name', p.fullName);
  setVal('input-email', p.email);
  setVal('input-phone', p.phone);
  setVal('input-address', p.address);
  setVal('input-designation', p.designation);
  setVal('input-github', p.githubUrl);
  setVal('input-linkedin', p.linkedinUrl);
  setVal('input-portfolio', p.portfolioUrl);
  setVal('input-summary', resumeState.summary);
  setVal('input-skills', (resumeState.skills || []).join(', '));
  setVal('input-languages', (resumeState.languages || []).join(', '));

  // Select template radio or button
  const tBtn = document.querySelector(`[data-template="${resumeState.template}"]`);
  if (tBtn) {
    document.querySelectorAll('.template-choice-btn').forEach(b => b.classList.remove('active'));
    tBtn.classList.add('active');
  }
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || '';
}

/**
 * Bind form inputs to live state & preview
 */
function bindFormInputs() {
  const pInputs = [
    { id: 'input-name', key: 'fullName' },
    { id: 'input-email', key: 'email' },
    { id: 'input-phone', key: 'phone' },
    { id: 'input-address', key: 'address' },
    { id: 'input-designation', key: 'designation' },
    { id: 'input-github', key: 'githubUrl' },
    { id: 'input-linkedin', key: 'linkedinUrl' },
    { id: 'input-portfolio', key: 'portfolioUrl' }
  ];

  pInputs.forEach(({ id, key }) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', (e) => {
        resumeState.personalInfo[key] = e.target.value;
        updateLivePreview();
      });
    }
  });

  const sumEl = document.getElementById('input-summary');
  if (sumEl) {
    sumEl.addEventListener('input', (e) => {
      resumeState.summary = e.target.value;
      updateLivePreview();
    });
  }

  const skillEl = document.getElementById('input-skills');
  if (skillEl) {
    skillEl.addEventListener('input', (e) => {
      resumeState.skills = e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
      updateLivePreview();
    });
  }

  const langEl = document.getElementById('input-languages');
  if (langEl) {
    langEl.addEventListener('input', (e) => {
      resumeState.languages = e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
      updateLivePreview();
    });
  }

  const saveBtn = document.getElementById('btn-save-resume');
  if (saveBtn) {
    saveBtn.addEventListener('click', saveResumeData);
  }

  const downloadBtn = document.getElementById('btn-download-pdf');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadResumePDF);
  }
}

/**
 * Template Selection
 */
function bindTemplateSelector() {
  const templateBtns = document.querySelectorAll('.template-choice-btn');
  templateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      templateBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      resumeState.template = btn.getAttribute('data-template');
      updateLivePreview();
    });
  });
}

/**
 * Dynamic sections (Add/Delete Experience, Education, Projects, Certifications, Achievements)
 */
function bindDynamicSectionButtons() {
  const addExpBtn = document.getElementById('btn-add-experience');
  if (addExpBtn) {
    addExpBtn.addEventListener('click', () => {
      resumeState.experience.push({
        id: 'exp-' + Date.now(),
        role: 'Job Title',
        company: 'Company Name',
        location: 'Location',
        startDate: '2023',
        endDate: 'Present',
        description: 'Key accomplishment or responsibility.'
      });
      renderFormLists();
      updateLivePreview();
    });
  }

  const addEduBtn = document.getElementById('btn-add-education');
  if (addEduBtn) {
    addEduBtn.addEventListener('click', () => {
      resumeState.education.push({
        id: 'edu-' + Date.now(),
        degree: 'Degree / Program',
        institution: 'University / College',
        location: 'City, Country',
        year: '2024',
        score: 'Grade / GPA'
      });
      renderFormLists();
      updateLivePreview();
    });
  }

  const addProjBtn = document.getElementById('btn-add-project');
  if (addProjBtn) {
    addProjBtn.addEventListener('click', () => {
      resumeState.projects.push({
        id: 'proj-' + Date.now(),
        title: 'Project Name',
        technologies: 'Stack / Technologies',
        link: 'https://github.com/...',
        description: 'Project goals, features, and key engineering metrics achieved.'
      });
      renderFormLists();
      updateLivePreview();
    });
  }

  const addCertBtn = document.getElementById('btn-add-certification');
  if (addCertBtn) {
    addCertBtn.addEventListener('click', () => {
      resumeState.certifications.push({
        id: 'cert-' + Date.now(),
        name: 'Certificate Name',
        issuer: 'Issuing Organization',
        year: '2024'
      });
      renderFormLists();
      updateLivePreview();
    });
  }

  const addAchBtn = document.getElementById('btn-add-achievement');
  if (addAchBtn) {
    addAchBtn.addEventListener('click', () => {
      resumeState.achievements.push({
        id: 'ach-' + Date.now(),
        text: 'Honors, prize, or noteworthy professional milestone.'
      });
      renderFormLists();
      updateLivePreview();
    });
  }
}

/**
 * Render editable list items in form
 */
function renderFormLists() {
  // Experience
  const expContainer = document.getElementById('experience-items-container');
  if (expContainer) {
    expContainer.innerHTML = resumeState.experience.map((exp, idx) => `
      <div class="dynamic-entry-card" data-id="${exp.id}">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <strong>Experience #${idx + 1}</strong>
          <button type="button" class="btn btn-sm btn-danger" onclick="deleteExperience('${exp.id}')">Remove</button>
        </div>
        <div class="grid-cols-2">
          <input type="text" class="form-control" placeholder="Role / Title" value="${exp.role || ''}" oninput="updateExpField('${exp.id}', 'role', this.value)">
          <input type="text" class="form-control" placeholder="Company" value="${exp.company || ''}" oninput="updateExpField('${exp.id}', 'company', this.value)">
        </div>
        <div class="grid-cols-2" style="margin-top:8px;">
          <input type="text" class="form-control" placeholder="Dates (e.g. 2022 - Present)" value="${(exp.startDate || '') + ' - ' + (exp.endDate || '')}" oninput="updateExpDates('${exp.id}', this.value)">
          <input type="text" class="form-control" placeholder="Location" value="${exp.location || ''}" oninput="updateExpField('${exp.id}', 'location', this.value)">
        </div>
        <textarea class="form-control" style="margin-top:8px;min-height:70px;" placeholder="Bullet point descriptions" oninput="updateExpField('${exp.id}', 'description', this.value)">${exp.description || ''}</textarea>
      </div>
    `).join('');
  }

  // Education
  const eduContainer = document.getElementById('education-items-container');
  if (eduContainer) {
    eduContainer.innerHTML = resumeState.education.map((edu, idx) => `
      <div class="dynamic-entry-card" data-id="${edu.id}">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <strong>Education #${idx + 1}</strong>
          <button type="button" class="btn btn-sm btn-danger" onclick="deleteEducation('${edu.id}')">Remove</button>
        </div>
        <div class="grid-cols-2">
          <input type="text" class="form-control" placeholder="Degree" value="${edu.degree || ''}" oninput="updateEduField('${edu.id}', 'degree', this.value)">
          <input type="text" class="form-control" placeholder="Institution" value="${edu.institution || ''}" oninput="updateEduField('${edu.id}', 'institution', this.value)">
        </div>
        <div class="grid-cols-2" style="margin-top:8px;">
          <input type="text" class="form-control" placeholder="Graduation Year" value="${edu.year || ''}" oninput="updateEduField('${edu.id}', 'year', this.value)">
          <input type="text" class="form-control" placeholder="CGPA / Score" value="${edu.score || ''}" oninput="updateEduField('${edu.id}', 'score', this.value)">
        </div>
      </div>
    `).join('');
  }

  // Projects
  const projContainer = document.getElementById('project-items-container');
  if (projContainer) {
    projContainer.innerHTML = resumeState.projects.map((proj, idx) => `
      <div class="dynamic-entry-card" data-id="${proj.id}">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <strong>Project #${idx + 1}</strong>
          <button type="button" class="btn btn-sm btn-danger" onclick="deleteProject('${proj.id}')">Remove</button>
        </div>
        <div class="grid-cols-2">
          <input type="text" class="form-control" placeholder="Project Title" value="${proj.title || ''}" oninput="updateProjField('${proj.id}', 'title', this.value)">
          <input type="text" class="form-control" placeholder="Tech Stack" value="${proj.technologies || ''}" oninput="updateProjField('${proj.id}', 'technologies', this.value)">
        </div>
        <input type="text" class="form-control" style="margin-top:8px;" placeholder="Project Link / GitHub" value="${proj.link || ''}" oninput="updateProjField('${proj.id}', 'link', this.value)">
        <textarea class="form-control" style="margin-top:8px;min-height:60px;" placeholder="Description" oninput="updateProjField('${proj.id}', 'description', this.value)">${proj.description || ''}</textarea>
      </div>
    `).join('');
  }
}

// Global update handlers for dynamic lists
window.updateExpField = (id, key, val) => {
  const item = resumeState.experience.find(e => e.id === id);
  if (item) { item[key] = val; updateLivePreview(); }
};
window.updateExpDates = (id, val) => {
  const item = resumeState.experience.find(e => e.id === id);
  if (item) {
    const parts = val.split('-');
    item.startDate = parts[0] ? parts[0].trim() : '';
    item.endDate = parts[1] ? parts[1].trim() : '';
    updateLivePreview();
  }
};
window.deleteExperience = (id) => {
  resumeState.experience = resumeState.experience.filter(e => e.id !== id);
  renderFormLists();
  updateLivePreview();
};

window.updateEduField = (id, key, val) => {
  const item = resumeState.education.find(e => e.id === id);
  if (item) { item[key] = val; updateLivePreview(); }
};
window.deleteEducation = (id) => {
  resumeState.education = resumeState.education.filter(e => e.id !== id);
  renderFormLists();
  updateLivePreview();
};

window.updateProjField = (id, key, val) => {
  const item = resumeState.projects.find(p => p.id === id);
  if (item) { item[key] = val; updateLivePreview(); }
};
window.deleteProject = (id) => {
  resumeState.projects = resumeState.projects.filter(p => p.id !== id);
  renderFormLists();
  updateLivePreview();
};

/**
 * Render Live Resume Preview according to active template
 */
function updateLivePreview() {
  const previewContainer = document.getElementById('resume-preview-document');
  if (!previewContainer) return;

  const p = resumeState.personalInfo || {};
  const t = resumeState.template || 'modern';

  previewContainer.className = `resume-sheet template-${t}`;

  const contactItems = [
    p.email ? `<span>✉️ ${p.email}</span>` : '',
    p.phone ? `<span>📞 ${p.phone}</span>` : '',
    p.address ? `<span>📍 ${p.address}</span>` : '',
    p.linkedinUrl ? `<span>🔗 <a href="${p.linkedinUrl}" target="_blank">LinkedIn</a></span>` : '',
    p.githubUrl ? `<span>🐙 <a href="${p.githubUrl}" target="_blank">GitHub</a></span>` : '',
    p.portfolioUrl ? `<span>🌐 <a href="${p.portfolioUrl}" target="_blank">Portfolio</a></span>` : ''
  ].filter(Boolean).join(' &bull; ');

  const experienceHtml = (resumeState.experience || []).map(exp => `
    <div class="resume-item">
      <div class="item-header">
        <span class="item-title">${exp.role || 'Role'}</span>
        <span class="item-date">${exp.startDate || ''} – ${exp.endDate || ''}</span>
      </div>
      <div class="item-subheader">
        <span class="item-company">${exp.company || ''}</span>
        <span class="item-location">${exp.location || ''}</span>
      </div>
      <p class="item-desc">${exp.description || ''}</p>
    </div>
  `).join('');

  const educationHtml = (resumeState.education || []).map(edu => `
    <div class="resume-item">
      <div class="item-header">
        <span class="item-title">${edu.degree || 'Degree'}</span>
        <span class="item-date">${edu.year || ''}</span>
      </div>
      <div class="item-subheader">
        <span class="item-company">${edu.institution || ''}</span>
        <span class="item-location">${edu.score ? `Score: ${edu.score}` : ''}</span>
      </div>
    </div>
  `).join('');

  const projectsHtml = (resumeState.projects || []).map(proj => `
    <div class="resume-item">
      <div class="item-header">
        <span class="item-title">${proj.title || 'Project'}</span>
        ${proj.link ? `<a class="item-link" href="${proj.link}" target="_blank">Link</a>` : ''}
      </div>
      <div class="item-subheader">
        <span class="item-tech">${proj.technologies ? `Tech Stack: ${proj.technologies}` : ''}</span>
      </div>
      <p class="item-desc">${proj.description || ''}</p>
    </div>
  `).join('');

  const skillsHtml = (resumeState.skills || []).map(s => `<span class="res-skill-pill">${s}</span>`).join(' ');

  previewContainer.innerHTML = `
    <div class="resume-header">
      <h1 class="resume-name">${p.fullName || 'Your Name'}</h1>
      <div class="resume-designation">${p.designation || 'Target Designation'}</div>
      <div class="resume-contacts">${contactItems}</div>
    </div>

    ${resumeState.summary ? `
      <section class="resume-section">
        <h2 class="section-heading">Professional Summary</h2>
        <p class="summary-text">${resumeState.summary}</p>
      </section>
    ` : ''}

    ${skillsHtml ? `
      <section class="resume-section">
        <h2 class="section-heading">Technical Skills</h2>
        <div class="skills-wrap">${skillsHtml}</div>
      </section>
    ` : ''}

    ${experienceHtml ? `
      <section class="resume-section">
        <h2 class="section-heading">Experience</h2>
        <div class="items-list">${experienceHtml}</div>
      </section>
    ` : ''}

    ${projectsHtml ? `
      <section class="resume-section">
        <h2 class="section-heading">Projects</h2>
        <div class="items-list">${projectsHtml}</div>
      </section>
    ` : ''}

    ${educationHtml ? `
      <section class="resume-section">
        <h2 class="section-heading">Education</h2>
        <div class="items-list">${educationHtml}</div>
      </section>
    ` : ''}
  `;
}

/**
 * Save resume state to Firestore backend
 */
async function saveResumeData() {
  const saveBtn = document.getElementById('btn-save-resume');
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="spinner"></span> Saving...';
  }

  try {
    const res = await apiRequest('/resume-builder/save', {
      method: 'POST',
      body: JSON.stringify(resumeState)
    });

    if (res.success) {
      showToast('Resume saved to your account successfully!', 'success');
    }
  } catch (error) {
    showToast('Failed to save resume: ' + error.message, 'error');
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '💾 Save Resume';
    }
  }
}

/**
 * Download Resume as PDF via native print formatting
 */
function downloadResumePDF() {
  window.print();
}

document.addEventListener('DOMContentLoaded', () => {
  initResumeBuilder();
});
