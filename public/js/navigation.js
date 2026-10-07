// Smart Resume Ranker - Shared Sidebar & Navigation System

function renderSidebarNavigation() {
  const sidebarContainer = document.getElementById('sidebar-container');
  if (!sidebarContainer) return;

  const rawPath = window.location.pathname.split('/').pop() || 'dashboard';
  const currentPath = rawPath.replace('.html', '').toLowerCase();

  const user = JSON.parse(localStorage.getItem('srr_user') || '{}');
  const displayName = user.name || 'User Profile';
  const displayEmail = user.email || 'user@example.com';
  const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'SR';

  sidebarContainer.innerHTML = `
    <aside class="sidebar" id="app-sidebar">
      <div class="sidebar-header">
        <a href="dashboard.html" class="brand-logo">
          <div class="brand-icon">SR</div>
          <span class="brand-name">SMART RESUME</span>
        </a>
      </div>

      <nav class="sidebar-nav">
        <a href="dashboard.html" class="nav-item ${currentPath === 'dashboard' ? 'active' : ''}">
          <span class="nav-icon">📊</span>
          <span>Dashboard</span>
        </a>

        <div class="nav-section-title">Resume Tools</div>
        <a href="resume.html" class="nav-item ${currentPath === 'resume' ? 'active' : ''}">
          <span class="nav-icon">📄</span>
          <span>Upload & ATS Score</span>
        </a>
        <a href="resume-builder.html" class="nav-item ${currentPath === 'resume-builder' ? 'active' : ''}">
          <span class="nav-icon">🛠️</span>
          <span>Resume Builder</span>
        </a>

        <div class="nav-section-title">Skills & Growth</div>
        <a href="skill-gap.html" class="nav-item ${currentPath === 'skill-gap' ? 'active' : ''}">
          <span class="nav-icon">🎯</span>
          <span>Skill Gap Analysis</span>
        </a>
        <a href="roadmap.html" class="nav-item ${currentPath === 'roadmap' ? 'active' : ''}">
          <span class="nav-icon">🗺️</span>
          <span>Learning Roadmap</span>
        </a>

        <div class="nav-section-title">Application Suite</div>
        <a href="cover-letter.html" class="nav-item ${currentPath === 'cover-letter' ? 'active' : ''}">
          <span class="nav-icon">✉️</span>
          <span>Cover Letter</span>
        </a>
        <a href="recruiter-outreach.html" class="nav-item ${currentPath === 'recruiter-outreach' ? 'active' : ''}">
          <span class="nav-icon">🤝</span>
          <span>Recruiter Outreach</span>
        </a>
        <a href="mock-interview.html" class="nav-item ${currentPath === 'mock-interview' ? 'active' : ''}">
          <span class="nav-icon">🎙️</span>
          <span>Mock Interview</span>
        </a>

        <div class="nav-section-title">Career Opportunities</div>
        <a href="job-explorer.html" class="nav-item ${currentPath === 'job-explorer' ? 'active' : ''}">
          <span class="nav-icon">💼</span>
          <span>Job Explorer</span>
        </a>

        <div class="nav-section-title">Account</div>
        <a href="profile.html" class="nav-item ${currentPath === 'profile' ? 'active' : ''}">
          <span class="nav-icon">👤</span>
          <span>Profile</span>
        </a>
        <a href="settings.html" class="nav-item ${currentPath === 'settings' ? 'active' : ''}">
          <span class="nav-icon">⚙️</span>
          <span>Settings</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="user-quick-profile" onclick="window.location.href='profile.html'">
          <div class="user-avatar-mini">${initials}</div>
          <div class="user-info-text">
            <div class="user-name-title">${displayName}</div>
            <div class="user-email-subtitle">${displayEmail}</div>
          </div>
        </div>
      </div>
    </aside>
    <div class="sidebar-backdrop" id="sidebar-backdrop"></div>
  `;

  setupSidebarEvents();
}

function setupSidebarEvents() {
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  const toggleBtn = document.getElementById('btn-mobile-nav');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      backdrop.classList.toggle('active');
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('open');
      backdrop.classList.remove('active');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderSidebarNavigation();
});
