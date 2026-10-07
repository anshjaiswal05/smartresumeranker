// Smart Resume Ranker - Dashboard Logic

async function loadDashboardData() {
  try {
    const response = await apiRequest('/dashboard/stats');
    if (!response || !response.stats) return;

    const stats = response.stats;

    // Render Stats
    const atsScoreElem = document.getElementById('stat-ats-score');
    if (atsScoreElem) atsScoreElem.textContent = stats.atsScore > 0 ? `${stats.atsScore} / 100` : 'Not Analyzed';

    const profileElem = document.getElementById('stat-profile-comp');
    if (profileElem) profileElem.textContent = `${stats.profileCompletion}%`;

    const skillsElem = document.getElementById('stat-skills-detected');
    if (skillsElem) skillsElem.textContent = stats.skillsDetectedCount || 0;

    const missingSkillsElem = document.getElementById('stat-missing-skills');
    if (missingSkillsElem) missingSkillsElem.textContent = stats.missingSkillsCount || 0;

    const targetJobElem = document.getElementById('stat-target-job');
    if (targetJobElem) targetJobElem.textContent = stats.targetRole || 'Software Engineer';

    const savedJobsElem = document.getElementById('stat-saved-jobs');
    if (savedJobsElem) savedJobsElem.textContent = stats.savedJobsCount || 0;

    const mockScoreElem = document.getElementById('stat-mock-score');
    if (mockScoreElem) mockScoreElem.textContent = stats.latestMockInterviewScore;

    // Render Recent Activity Stream
    const activityListElem = document.getElementById('recent-activity-list');
    if (activityListElem) {
      if (!stats.recentActivity || stats.recentActivity.length === 0) {
        activityListElem.innerHTML = `
          <li class="activity-item">
            <div class="activity-icon">🚀</div>
            <div class="activity-content">
              <div class="activity-title">Ready to Begin</div>
              <div class="activity-details">Upload your resume to discover your ATS score and skill gaps.</div>
            </div>
          </li>
        `;
      } else {
        activityListElem.innerHTML = stats.recentActivity.map(item => {
          let icon = '📌';
          if (item.activityType === 'resume_analyzed') icon = '📄';
          else if (item.activityType === 'skill_gap_analyzed') icon = '🎯';
          else if (item.activityType === 'interview_completed') icon = '🎙️';
          else if (item.activityType === 'cover_letter_generated') icon = '✉️';
          else if (item.activityType === 'job_saved') icon = '💼';

          const timeFormatted = item.timestamp ? new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

          return `
            <li class="activity-item">
              <div class="activity-icon">${icon}</div>
              <div class="activity-content">
                <div class="activity-title">${item.title || 'Activity'}</div>
                <div class="activity-details">${item.details || ''}</div>
                <div class="activity-time">${timeFormatted}</div>
              </div>
            </li>
          `;
        }).join('');
      }
    }
  } catch (error) {
    console.error('Failed to load dashboard:', error);
    showToast('Failed to load dashboard metrics: ' + error.message, 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadDashboardData();
});
