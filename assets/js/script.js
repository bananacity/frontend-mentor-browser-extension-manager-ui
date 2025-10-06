import { animate } from 'https://cdn.jsdelivr.net/npm/motion@12.23.20/+esm';

const extensionsContainer = document.querySelector('.extensions');
const filtersForm = document.querySelector('.filters-form');

let allExtensions;
let activeExtensions;
let inactiveExtensions;

async function getExtensions() {
  const url = './data.json';

  try {
    const response = await fetch(url);

    if (!response.ok)
      throw new Error(
        `Couldn't fetch extensions. Response status: ${response.status}`
      );

    const result = await response.json();

    return result;
  } catch (error) {
    console.error(`Couldn't fetch extensions: ${error.message}`);
  }
}

function getActiveFilter() {
  return document.querySelector(`[name="extensionsFilter"]:checked`).value;
}

function filterExtensions() {
  activeExtensions = allExtensions.filter((extension) => extension.isActive);
  inactiveExtensions = allExtensions.filter((extension) => !extension.isActive);

  const activeFilter = getActiveFilter();

  if (activeFilter === 'inactive') return inactiveExtensions;
  else if (activeFilter === 'active') return activeExtensions;
  else return allExtensions;
}

function renderExtensions(extensions, animateDom = true) {
  if (!extensions || !extensions.length) {
    extensionsContainer.innerHTML = `<p class="no-extensions-warning text-preset-5">No extensions found.</p>`;
    return;
  }

  extensionsContainer.textContent = '';

  for (let extension of extensions) {
    renderExtension(extension, animateDom);
  }
}

function renderExtension(extension, animateDom = true) {
  const newExtension = document.createElement('article');
  newExtension.className = 'extension';
  newExtension.dataset.extensionid = extension.id;
  newExtension.innerHTML = `<div class="extension-info">
              <img
                src="${extension.logo}"
                alt="${extension.name} Logo"
                class="extension-logo"
                draggable="false"
              />

              <div class="extension-details">
                <h2 class="extension-title text-preset-2">${extension.name}</h2>

                <p class="extension-desc text-preset-5">${
                  extension.description
                }</p>
              </div>
            </div>

            <div class="extension-controls">
              <button
                aria-label="Remove extension"
                class="btn-remove text-preset-6"
              >
                Remove
              </button>

              <input
                type="checkbox"
                class="toggle"
                aria-label="${extension.isActive ? 'Deactivate' : 'Activate'} ${
    extension.name
  } extension"
                ${extension.isActive ? 'checked' : ''}
              />
            </div>`;

  extensionsContainer.appendChild(newExtension);
  if (animateDom) {
    animate(
      newExtension,
      { opacity: [0, 1], transform: ['scale(0.95)', 'scale(1)'] },
      { duration: 0.3, easing: 'ease-in-out' }
    );
  }
}

async function removeExtensionDom(extension, animateDom = true) {
  if (animateDom) {
    const animation = animate(
      extension,
      { opacity: [1, 0], transform: ['scale(1)', 'scale(0.95)'] },
      { duration: 0.3, easing: 'ease-in-out' }
    );

    await animation.finished;
  }

  extension.remove();

  const extensions = filterExtensions();
  if (!extensions || !extensions.length) {
    renderExtensions(extension);
  }
}

getExtensions()
  .then(
    (extensions) =>
      (allExtensions = extensions
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((extension, index) => ({
          ...extension,
          id: index,
        })))
  )
  .then(() => renderExtensions(filterExtensions()));

filtersForm.addEventListener('change', () =>
  renderExtensions(filterExtensions(), false)
);

extensionsContainer.addEventListener('click', (event) => {
  if (event.target.classList.contains('btn-remove')) {
    event.target.disabled = true;

    const extension = event.target.closest('.extension');
    const id = Number(extension.dataset.extensionid);

    const index = allExtensions.findIndex((el) => el.id === id);

    allExtensions.splice(index, 1);

    filterExtensions();

    removeExtensionDom(extension);
  }
});

extensionsContainer.addEventListener('change', async (event) => {
  if (event.target.classList.contains('toggle')) {
    event.target.disabled = true;

    const extensionEl = event.target.closest('.extension');
    const id = Number(extensionEl.dataset.extensionid);

    const extension = allExtensions.find((el) => el.id === id);

    extension.isActive = event.target.checked;

    if (getActiveFilter() !== 'all') {
      await removeExtensionDom(extensionEl);
    }

    event.target.disabled = false;
  }
});
