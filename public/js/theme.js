// Smart Resume Ranker - Theme Management (Light / Dark Mode)
(function () {
  const THEME_KEY = 'srr_theme_preference';

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    updateToggleButtons(theme);
  }

  function getPreferredTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  }

  function updateToggleButtons(theme) {
    const btns = document.querySelectorAll('.theme-toggle-btn, .btn-theme-toggle');
    btns.forEach(btn => {
      const isDark = theme === 'dark';
      btn.innerHTML = isDark
        ? '☀️ <span class="toggle-text">Light Mode</span>'
        : '🌙 <span class="toggle-text">Dark Mode</span>';
      btn.setAttribute('aria-label', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    });
  }

  // Initialize theme as early as possible
  const initialTheme = getPreferredTheme();
  applyTheme(initialTheme);

  document.addEventListener('DOMContentLoaded', () => {
    updateToggleButtons(document.documentElement.getAttribute('data-theme') || 'light');
    document.querySelectorAll('.theme-toggle-btn, .btn-theme-toggle').forEach(btn => {
      btn.addEventListener('click', toggleTheme);
    });
  });

  window.toggleAppTheme = toggleTheme;
})();
