// Smart Resume Ranker - Job Explorer Logic (India Tech Opportunities)

let savedJobIds = new Set();

async function initJobExplorer() {
  await loadSavedJobIds();
  setupJobFilters();
  await fetchAndRenderJobs();
}

/**
 * Load user's saved job IDs to show saved indicator
 */
async function loadSavedJobIds() {
  try {
    const res = await apiRequest('/jobs/saved');
    if (res.success && res.jobs) {
      savedJobIds = new Set(res.jobs.map(j => j.id));
    }
  } catch (err) {
    console.warn('Could not load saved jobs:', err.message);
  }
}

function setupJobFilters() {
  const searchInput = document.getElementById('input-job-search');
  const locationSelect = document.getElementById('select-job-location');
  const typeSelect = document.getElementById('select-workplace-type');
  const sortSelect = document.getElementById('select-job-sort');
  const filterBtn = document.getElementById('btn-apply-filters');
  const savedTabBtn = document.getElementById('tab-saved-jobs');
  const allTabBtn = document.getElementById('tab-all-jobs');

  if (filterBtn) {
    filterBtn.addEventListener('click', () => fetchAndRenderJobs());
  }

  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') fetchAndRenderJobs();
    });
  }

  if (allTabBtn && savedTabBtn) {
    allTabBtn.addEventListener('click', () => {
      allTabBtn.classList.add('active');
      savedTabBtn.classList.remove('active');
      fetchAndRenderJobs();
    });

    savedTabBtn.addEventListener('click', () => {
      savedTabBtn.classList.add('active');
      allTabBtn.classList.remove('active');
      fetchAndRenderSavedJobs();
    });
  }
}

async function fetchAndRenderJobs() {
  const container = document.getElementById('jobs-results-container');
  if (container) {
    container.innerHTML = '<div style="text-align:center;padding:48px;"><span class="spinner"></span> Loading tech jobs...</div>';
  }

  const query = (document.getElementById('input-job-search') || {}).value || '';
  const location = (document.getElementById('select-job-location') || {}).value || '';
  const workplaceType = (document.getElementById('select-workplace-type') || {}).value || '';
  const sortBy = (document.getElementById('select-job-sort') || {}).value || 'latest';

  const params = new URLSearchParams();
  if (query) params.append('query', query);
  if (location) params.append('location', location);
  if (workplaceType) params.append('workplaceType', workplaceType);
  if (sortBy) params.append('sortBy', sortBy);

  try {
    const res = await apiRequest(`/jobs?${params.toString()}`);
    if (res.success && res.data) {
      renderJobCards(res.data.jobs, container);
    }
  } catch (error) {
    console.error('Job search error:', error);
    if (container) {
      container.innerHTML = `<div class="card" style="text-align:center;color:var(--accent-danger);padding:32px;">Unable to load tech jobs right now. Please verify connection and try again.</div>`;
    }
  }
}

async function fetchAndRenderSavedJobs() {
  const container = document.getElementById('jobs-results-container');
  if (container) {
    container.innerHTML = '<div style="text-align:center;padding:48px;"><span class="spinner"></span> Loading saved jobs...</div>';
  }

  try {
    const res = await apiRequest('/jobs/saved');
    if (res.success && res.jobs) {
      if (res.jobs.length === 0) {
        container.innerHTML = `<div class="card" style="text-align:center;padding:40px;color:var(--text-muted);">You have not saved any jobs yet. Browse listings and click "Save Job".</div>`;
      } else {
        renderJobCards(res.jobs, container, true);
      }
    }
  } catch (error) {
    console.error('Failed to load saved jobs:', error);
  }
}

function renderJobCards(jobs, container, isSavedView = false) {
  if (!container) return;

  if (!jobs || jobs.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align:center;padding:48px;color:var(--text-muted);">
        <h3>No matching jobs found</h3>
        <p style="margin-top:8px;">Try broadening your keywords or removing location filters.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = jobs.map(job => {
    const isSaved = savedJobIds.has(job.id);
    const skillsHtml = (job.skills || []).map(s => `<span class="skill-tag">${s}</span>`).join('');

    return `
      <div class="card job-card" id="card-${job.id}" style="margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;">
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
              <h3 style="font-size:18px;font-weight:700;">${job.title}</h3>
              <span class="badge badge-primary">${job.workplaceType || 'Full-time'}</span>
            </div>
            <div style="font-size:14px;color:var(--text-muted);font-weight:600;margin-bottom:10px;">
              🏢 ${job.company} &bull; 📍 ${job.location} &bull; ⏱️ ${job.experience}
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:16px;font-weight:800;color:var(--accent-success);margin-bottom:6px;">${job.salary || 'Competitive'}</div>
            <span style="font-size:12px;color:var(--text-muted);">${job.postedDate}</span>
          </div>
        </div>

        <p style="font-size:14px;color:var(--text-secondary);margin-bottom:14px;line-height:1.5;">${job.description}</p>

        <div style="margin-bottom:16px;">
          ${skillsHtml}
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--border-color);padding-top:14px;">
          <span style="font-size:12px;color:var(--text-muted);">Source: ${job.source}</span>
          <div style="display:flex;gap:10px;">
            <button class="btn btn-sm ${isSaved ? 'btn-secondary' : 'btn-outline'}" onclick="toggleSaveJob('${job.id}', ${JSON.stringify(job).replace(/"/g, '&quot;')})">
              ${isSaved ? '🔖 Saved' : '🤍 Save Job'}
            </button>
            <a href="${job.applyLink}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary">
              Apply on Company Site ↗
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

async function toggleSaveJob(jobId, jobData) {
  const isSaved = savedJobIds.has(jobId);

  try {
    if (isSaved) {
      await apiRequest(`/jobs/saved/${jobId}`, { method: 'DELETE' });
      savedJobIds.delete(jobId);
      showToast('Job removed from saved list.', 'info');
    } else {
      await apiRequest('/jobs/save', {
        method: 'POST',
        body: JSON.stringify(jobData)
      });
      savedJobIds.add(jobId);
      showToast('Job saved to your profile!', 'success');
    }
    // Re-render
    const activeTab = document.getElementById('tab-saved-jobs');
    if (activeTab && activeTab.classList.contains('active')) {
      fetchAndRenderSavedJobs();
    } else {
      fetchAndRenderJobs();
    }
  } catch (err) {
    showToast('Failed to update saved job: ' + err.message, 'error');
  }
}

window.toggleSaveJob = toggleSaveJob;

document.addEventListener('DOMContentLoaded', () => {
  initJobExplorer();
});
