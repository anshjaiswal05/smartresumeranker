// Smart Resume Ranker - Resume Upload & ATS Scoring Frontend Logic

let selectedFile = null;

function setupUploadZone() {
  const dropZone = document.getElementById('resume-drop-zone');
  const fileInput = document.getElementById('resume-file-input');
  const fileDetails = document.getElementById('selected-file-details');
  const fileNameDisplay = document.getElementById('selected-file-name');
  const analyzeBtn = document.getElementById('btn-analyze-resume');

  if (!dropZone || !fileInput) return;

  dropZone.addEventListener('click', () => fileInput.click());

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  });

  function handleFileSelected(file) {
    const validExtensions = ['.pdf', '.doc', '.docx'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();

    if (!validExtensions.includes(ext)) {
      showToast('Invalid file format. Please upload a PDF, DOC, or DOCX resume.', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('File size exceeds 10MB limit. Please choose a smaller file.', 'error');
      return;
    }

    selectedFile = file;
    if (fileNameDisplay) fileNameDisplay.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    if (fileDetails) fileDetails.style.display = 'block';
    if (analyzeBtn) analyzeBtn.disabled = false;
  }

  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', runResumeAnalysis);
  }
}

async function runResumeAnalysis() {
  if (!selectedFile) {
    showToast('Please select a resume file first.', 'error');
    return;
  }

  const analyzeBtn = document.getElementById('btn-analyze-resume');
  const targetRoleInput = document.getElementById('target-role-input');
  const targetRole = targetRoleInput ? targetRoleInput.value.trim() : 'Software Engineer';
  const progressContainer = document.getElementById('analysis-progress-container');
  const resultsContainer = document.getElementById('ats-results-container');

  if (analyzeBtn) {
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<span class="spinner"></span> Analyzing your resume...';
  }

  if (progressContainer) progressContainer.style.display = 'block';
  if (resultsContainer) resultsContainer.style.display = 'none';

  const formData = new FormData();
  formData.append('resume', selectedFile);
  formData.append('targetRole', targetRole);

  try {
    const response = await apiRequest('/resume/analyze', {
      method: 'POST',
      body: formData
    });

    if (response.success && response.data) {
      showToast('Resume analysis completed successfully!', 'success');
      renderAnalysisResults(response.data);
    }
  } catch (error) {
    console.error('Analysis error:', error);
    showToast('Unable to analyze your resume right now. Please try again. ' + error.message, 'error');
  } finally {
    if (analyzeBtn) {
      analyzeBtn.disabled = false;
      analyzeBtn.innerHTML = '⚡ Analyze Resume Now';
    }
    if (progressContainer) progressContainer.style.display = 'none';
  }
}

function renderAnalysisResults(data) {
  const container = document.getElementById('ats-results-container');
  if (!container) return;

  container.style.display = 'block';
  container.scrollIntoView({ behavior: 'smooth' });

  // Score number
  const scoreElem = document.getElementById('result-ats-score');
  if (scoreElem) scoreElem.textContent = data.atsScore || 0;

  // Candidate info
  const nameElem = document.getElementById('result-candidate-name');
  if (nameElem) nameElem.textContent = data.candidateName || 'Candidate';

  const emailElem = document.getElementById('result-candidate-email');
  if (emailElem) emailElem.textContent = (data.contactInfo && data.contactInfo.email) || 'Not detected';

  const phoneElem = document.getElementById('result-candidate-phone');
  if (phoneElem) phoneElem.textContent = (data.contactInfo && data.contactInfo.phone) || 'Not detected';

  const summaryElem = document.getElementById('result-summary');
  if (summaryElem) summaryElem.textContent = data.professionalSummary || '';

  const compatElem = document.getElementById('result-compatibility');
  if (compatElem) compatElem.textContent = data.atsCompatibility || 'Good';

  // Tech skills
  const skillsListElem = document.getElementById('result-tech-skills');
  if (skillsListElem) {
    skillsListElem.innerHTML = (data.technicalSkills || []).map(s => `<span class="skill-tag have">${s}</span>`).join('') || '<span class="text-muted">No technical skills detected</span>';
  }

  // Soft skills
  const softSkillsElem = document.getElementById('result-soft-skills');
  if (softSkillsElem) {
    softSkillsElem.innerHTML = (data.softSkills || []).map(s => `<span class="skill-tag">${s}</span>`).join('') || '<span class="text-muted">No soft skills detected</span>';
  }

  // Strengths
  const strengthsElem = document.getElementById('result-strengths');
  if (strengthsElem) {
    strengthsElem.innerHTML = (data.strengths || []).map(s => `<li>${s}</li>`).join('');
  }

  // Weaknesses
  const weaknessesElem = document.getElementById('result-weaknesses');
  if (weaknessesElem) {
    weaknessesElem.innerHTML = (data.weaknesses || []).map(w => `<li>${w}</li>`).join('');
  }

  // Missing Keywords
  const missingElem = document.getElementById('result-missing-keywords');
  if (missingElem) {
    missingElem.innerHTML = (data.missingKeywords || []).map(k => `<span class="skill-tag missing-high">${k}</span>`).join('');
  }

  // Recommendations
  const recsElem = document.getElementById('result-recommendations');
  if (recsElem) {
    recsElem.innerHTML = (data.recommendations || []).map(r => `<li>${r}</li>`).join('');
  }

  // Score breakdown
  if (data.scoreBreakdown) {
    const contactElem = document.getElementById('breakdown-contact');
    if (contactElem) contactElem.textContent = data.scoreBreakdown.contactScore;

    const sectionsElem = document.getElementById('breakdown-sections');
    if (sectionsElem) sectionsElem.textContent = data.scoreBreakdown.sectionScore;

    const skillElem = document.getElementById('breakdown-skills');
    if (skillElem) skillElem.textContent = data.scoreBreakdown.skillScore;

    const depthElem = document.getElementById('breakdown-depth');
    if (depthElem) depthElem.textContent = data.scoreBreakdown.depthScore;

    const formatElem = document.getElementById('breakdown-format');
    if (formatElem) formatElem.textContent = data.scoreBreakdown.formatScore;
  }
}

async function loadLatestAnalysis() {
  try {
    const response = await apiRequest('/resume/latest');
    if (response.success && response.data) {
      renderAnalysisResults(response.data);
    }
  } catch (err) {
    console.log('No previous analysis found:', err.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setupUploadZone();
  loadLatestAnalysis();
});
