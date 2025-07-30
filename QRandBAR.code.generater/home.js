//----------------
// File: home.js
document.querySelectorAll('.group').forEach(icon => {
  icon.addEventListener('focusin', () => {
    icon.querySelector('span').classList.add('opacity-100');
  });
  icon.addEventListener('focusout', () => {
    icon.querySelector('span').classList.remove('opacity-100');
  });
});