const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

const themeBtn = document.querySelector('.theme-toggle');

let selectedTheme;

function handleThemeChange(e) {
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme) {
    selectedTheme = savedTheme;
  } else {
    selectedTheme = e.matches ? 'dark' : 'light';
  }

  document.documentElement.setAttribute('data-theme', selectedTheme);
}

function toggleTheme() {
  selectedTheme = selectedTheme === 'dark' ? 'light' : 'dark';

  localStorage.setItem('theme', selectedTheme);

  document.startViewTransition(() => {
    handleThemeChange();
  });
}

mediaQuery.addEventListener('change', handleThemeChange);

handleThemeChange(mediaQuery);

themeBtn.addEventListener('click', toggleTheme);
