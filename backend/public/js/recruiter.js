// Smart Resume Ranker - Recruiter Outreach Generator Logic

let generatedOutreach = null;

async function initRecruiterOutreach() {
  const generateBtn = document.getElementById('btn-generate-outreach');
  if (generateBtn) {
    generateBtn.addEventListener('click', generateOutreachMessages);
  }

  // Copy Buttons
  setupCopyButtons();
}

function setupCopyButtons() {
  const copyLinkedin = document.getElementById('btn-copy-linkedin');
  if (copyLinkedin) {
    copyLinkedin.addEventListener('click', () => {
      copyFieldValue('text-linkedin-msg', 'LinkedIn message copied!');
    });
  }

  const copyEmail = document.getElementById('btn-copy-email');
  if (copyEmail) {
    copyEmail.addEventListener('click', () => {
      copyFieldValue('text-cold-email', 'Cold email copied!');
    });
  }

  const copyShort = document.getElementById('btn-copy-short');
  if (copyShort) {
    copyShort.addEventListener('click', () => {
      copyFieldValue('text-short-dm', 'Short message copied!');
    });
  }
}

function copyFieldValue(elementId, successMsg) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const text = el.value || el.textContent;
  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    showToast(successMsg, 'success');
  }).catch(() => {
    showToast('Copied to clipboard!', 'success');
  });
}

async function generateOutreachMessages() {
  const companyInput = document.getElementById('input-outreach-company');
  const roleInput = document.getElementById('input-outreach-role');
  const recruiterInput = document.getElementById('input-outreach-recruiter');
  const descInput = document.getElementById('textarea-outreach-desc');
  const generateBtn = document.getElementById('btn-generate-outreach');
  const outputSection = document.getElementById('outreach-output-section');

  const companyName = companyInput ? companyInput.value.trim() : '';
  const jobTitle = roleInput ? roleInput.value.trim() : '';
  const recruiterName = recruiterInput ? recruiterInput.value.trim() : '';
  const jobDescription = descInput ? descInput.value.trim() : '';

  if (!companyName || !jobTitle) {
    showToast('Please provide Company Name and Job Title.', 'warning');
    return;
  }

  if (generateBtn) {
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<span class="spinner"></span> Generating outreach messages with Gemini...';
  }

  try {
    const res = await apiRequest('/ai/recruiter-outreach', {
      method: 'POST',
      body: JSON.stringify({
        companyName,
        jobTitle,
        recruiterName,
        jobDescription
      })
    });

    if (res.success && res.messages) {
      generatedOutreach = res.messages;

      const linkedinEl = document.getElementById('text-linkedin-msg');
      if (linkedinEl) linkedinEl.value = res.messages.linkedinMessage || '';

      const emailEl = document.getElementById('text-cold-email');
      if (emailEl) emailEl.value = res.messages.coldEmail || '';

      const shortEl = document.getElementById('text-short-dm');
      if (shortEl) shortEl.value = res.messages.shortDM || '';

      if (outputSection) {
        outputSection.style.display = 'block';
        outputSection.scrollIntoView({ behavior: 'smooth' });
      }

      showToast('Outreach messages created successfully!', 'success');
    }
  } catch (error) {
    console.error('Outreach error:', error);
    showToast('Failed to generate messages: ' + error.message, 'error');
  } finally {
    if (generateBtn) {
      generateBtn.disabled = false;
      generateBtn.innerHTML = '⚡ Generate Outreach Messages';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initRecruiterOutreach();
});
