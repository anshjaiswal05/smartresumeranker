// Smart Resume Ranker - AI Cover Letter Generator Logic

async function initCoverLetter() {
  const generateBtn = document.getElementById('btn-generate-letter');
  const copyBtn = document.getElementById('btn-copy-letter');
  const downloadBtn = document.getElementById('btn-download-letter');

  if (generateBtn) {
    generateBtn.addEventListener('click', generateCoverLetter);
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', copyLetterToClipboard);
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadLetterText);
  }
}

async function generateCoverLetter() {
  const jobTitleInput = document.getElementById('input-job-title');
  const companyInput = document.getElementById('input-company-name');
  const toneSelect = document.getElementById('select-letter-tone');
  const descInput = document.getElementById('textarea-job-desc');
  const generateBtn = document.getElementById('btn-generate-letter');
  const outputTextarea = document.getElementById('textarea-output-letter');
  const outputContainer = document.getElementById('letter-output-card');

  const jobTitle = jobTitleInput ? jobTitleInput.value.trim() : '';
  const targetCompany = companyInput ? companyInput.value.trim() : '';
  const letterTone = toneSelect ? toneSelect.value : 'Professional';
  const jobDescription = descInput ? descInput.value.trim() : '';

  if (!jobTitle || !targetCompany) {
    showToast('Please specify Job Title and Target Company.', 'warning');
    return;
  }

  if (generateBtn) {
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<span class="spinner"></span> Crafting tailored cover letter with Gemini...';
  }

  try {
    const res = await apiRequest('/ai/cover-letter', {
      method: 'POST',
      body: JSON.stringify({
        jobTitle,
        targetCompany,
        letterTone,
        jobDescription
      })
    });

    if (res.success && res.coverLetter) {
      if (outputTextarea) outputTextarea.value = res.coverLetter;
      if (outputContainer) {
        outputContainer.style.display = 'block';
        outputContainer.scrollIntoView({ behavior: 'smooth' });
      }
      showToast('Cover letter generated successfully!', 'success');
    }
  } catch (error) {
    console.error('Cover letter generation error:', error);
    showToast('Failed to generate cover letter: ' + error.message, 'error');
  } finally {
    if (generateBtn) {
      generateBtn.disabled = false;
      generateBtn.innerHTML = '✨ Generate Tailored Cover Letter';
    }
  }
}

function copyLetterToClipboard() {
  const outputTextarea = document.getElementById('textarea-output-letter');
  if (!outputTextarea || !outputTextarea.value) return;

  navigator.clipboard.writeText(outputTextarea.value).then(() => {
    showToast('Cover letter copied to clipboard!', 'success');
  }).catch(() => {
    outputTextarea.select();
    document.execCommand('copy');
    showToast('Cover letter copied to clipboard!', 'success');
  });
}

function downloadLetterText() {
  const outputTextarea = document.getElementById('textarea-output-letter');
  const companyInput = document.getElementById('input-company-name');
  if (!outputTextarea || !outputTextarea.value) return;

  const company = companyInput ? companyInput.value.trim().replace(/\s+/g, '_') : 'Company';
  const blob = new Blob([outputTextarea.value], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Cover_Letter_${company}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Cover letter downloaded as text file.', 'info');
}

document.addEventListener('DOMContentLoaded', () => {
  initCoverLetter();
});
