// Highlights the nav link whose data-page matches the current filename.
(function () {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-item[data-page]').forEach(function (el) {
    if (el.dataset.page === page) {
      el.classList.add('active');
    }
  });
}());
