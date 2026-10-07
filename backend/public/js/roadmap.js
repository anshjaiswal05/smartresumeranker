// Smart Resume Ranker - Learning Roadmap Logic

let currentRoleId = 'frontend';
let currentRoadmap = null;
let userProgress = {};

async function initRoadmap() {
  bindRoleTabs();
  await loadRoadmap(currentRoleId);
}

function bindRoleTabs() {
  const tabs = document.querySelectorAll('.roadmap-role-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', async () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentRoleId = tab.getAttribute('data-role');
      await loadRoadmap(currentRoleId);
    });
  });
}

async function loadRoadmap(roleId) {
  const container = document.getElementById('roadmap-topics-container');
  if (container) {
    container.innerHTML = '<div style="text-align:center;padding:40px;"><span class="spinner"></span> Loading curriculum...</div>';
  }

  try {
    // 1. Fetch curriculum details
    const res = await apiRequest(`/roadmaps/${roleId}`);
    if (res && res.roadmap) {
      currentRoadmap = res.roadmap;
    }

    // 2. Fetch user's saved progress for this role
    try {
      const progRes = await apiRequest(`/roadmaps/progress/${roleId}`);
      if (progRes && progRes.progress) {
        userProgress = progRes.progress;
      } else {
        userProgress = {};
      }
    } catch (e) {
      userProgress = {};
    }

    renderRoadmapView();
  } catch (error) {
    console.error('Failed to load roadmap:', error);
    if (container) {
      container.innerHTML = `<div class="card" style="text-align:center;padding:32px;color:var(--accent-danger);">Failed to load roadmap. Please try again.</div>`;
    }
  }
}

function renderRoadmapView() {
  if (!currentRoadmap) return;

  // Title and Description
  const titleElem = document.getElementById('roadmap-title');
  if (titleElem) titleElem.textContent = currentRoadmap.title;

  const descElem = document.getElementById('roadmap-desc');
  if (descElem) descElem.textContent = currentRoadmap.description;

  // Prerequisites
  const prereqElem = document.getElementById('roadmap-prerequisites');
  if (prereqElem) {
    prereqElem.innerHTML = (currentRoadmap.prerequisites || []).map(p => `<li>${p}</li>`).join('');
  }

  // Calculate Progress Stats
  const topics = currentRoadmap.topics || [];
  let completedCount = 0;
  topics.forEach(t => {
    if (userProgress[t.id] === 'Completed') completedCount++;
  });
  const progressPct = topics.length > 0 ? Math.round((completedCount / topics.length) * 100) : 0;

  const pctElem = document.getElementById('roadmap-progress-percentage');
  if (pctElem) pctElem.textContent = `${progressPct}% Completed`;

  const barElem = document.getElementById('roadmap-progress-bar');
  if (barElem) barElem.style.width = `${progressPct}%`;

  // Render Topics
  const container = document.getElementById('roadmap-topics-container');
  if (!container) return;

  container.innerHTML = topics.map(topic => {
    const status = userProgress[topic.id] || 'Not Started';
    let statusBadgeClass = 'badge-secondary';
    if (status === 'In Progress') statusBadgeClass = 'badge-warning';
    if (status === 'Completed') statusBadgeClass = 'badge-success';

    const subtopicsHtml = (topic.subtopics || []).map(st => `<li>${st}</li>`).join('');
    const resourcesHtml = (topic.resources || []).map(r => `
      <a href="${r.url}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline" style="margin:4px 4px 4px 0;">
        🔗 ${r.name}
      </a>
    `).join('');

    return `
      <div class="card topic-card" id="card-${topic.id}">
        <div class="card-header">
          <div style="display:flex;align-items:center;gap:12px;">
            <div class="badge badge-primary" style="font-size:14px;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;">${topic.order}</div>
            <div>
              <h3 style="font-size:17px;font-weight:700;">${topic.title}</h3>
              <p style="font-size:13px;color:var(--text-muted);">${topic.description}</p>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <select class="form-control" style="width:140px;padding:6px 10px;font-size:13px;" onchange="updateTopicStatus('${topic.id}', this.value)">
              <option value="Not Started" ${status === 'Not Started' ? 'selected' : ''}>⏳ Not Started</option>
              <option value="In Progress" ${status === 'In Progress' ? 'selected' : ''}>🔄 In Progress</option>
              <option value="Completed" ${status === 'Completed' ? 'selected' : ''}>✅ Completed</option>
            </select>
          </div>
        </div>
        <div class="topic-body" style="padding-top:10px;">
          <h4 style="font-size:13px;text-transform:uppercase;color:var(--text-muted);margin-bottom:8px;">Subtopics to Master:</h4>
          <ul style="padding-left:20px;margin-bottom:16px;font-size:14px;color:var(--text-secondary);">
            ${subtopicsHtml}
          </ul>
          <h4 style="font-size:13px;text-transform:uppercase;color:var(--text-muted);margin-bottom:8px;">Recommended Resources:</h4>
          <div style="display:flex;flex-wrap:wrap;">
            ${resourcesHtml}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Update topic status in Firestore
 */
async function updateTopicStatus(topicId, status) {
  userProgress[topicId] = status;
  renderRoadmapView();

  try {
    await apiRequest('/roadmaps/progress', {
      method: 'POST',
      body: JSON.stringify({
        role: currentRoleId,
        topicId,
        status
      })
    });
    showToast(`Progress saved: ${status}`, 'success', 2000);
  } catch (err) {
    showToast('Failed to save progress: ' + err.message, 'error');
  }
}
window.updateTopicStatus = updateTopicStatus;

document.addEventListener('DOMContentLoaded', () => {
  initRoadmap();
});
