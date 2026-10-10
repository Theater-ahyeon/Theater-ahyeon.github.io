/**
 * Decorative navigation furniture only. Route state, rail coordinates, focus,
 * the portrait image and motion lifecycle remain owned by app/choreography.
 * Call once before the first render; calling again is safe.
 */
export function mountNavigationCinema(root = document) {
  const sidebar = root.querySelector('.sidebar');
  const nav = sidebar?.querySelector('.chapter-nav');
  const traveller = nav?.querySelector('.nav-traveller');
  if (!sidebar || !nav || !traveller) return false;
  if (sidebar.classList.contains('navigation-cinema')) return true;

  const ornament = (className, count) => {
    const span = document.createElement('span');
    span.className = className;
    span.setAttribute('aria-hidden', 'true');
    for (let index = 0; index < count; index += 1) {
      span.append(document.createElement('i'));
    }
    return span;
  };

  nav.prepend(ornament('nav-register', 3));
  traveller.append(ornament('nav-conduit', 2));
  nav.querySelectorAll('.chapter-link').forEach(link => {
    link.append(ornament('nav-record-plane', 3));
  });
  sidebar.querySelector('.side-portrait')?.append(ornament('portrait-aperture', 4));
  sidebar.classList.add('navigation-cinema');
  return true;
}
