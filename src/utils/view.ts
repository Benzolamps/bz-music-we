const view = {
  portable: window.innerWidth < 700 || screen.availWidth < 700,
  canPortable: screen.availWidth >= 700,
  togglePortable() {
    if (!this.portable) {
      window.resizeTo(500, 750);
      window.moveTo(screen.availWidth / 2 - 250, screen.availHeight - 760);
    } else {
      window.resizeTo(screen.availWidth, screen.availHeight);
    }
  }
};

function resizeCallback() {
  view.portable = window.innerWidth < 700 || screen.availWidth < 700;
  if (view.portable) {
    document.body.setAttribute('portable', 'true');
  } else {
    document.body.removeAttribute('portable');
  }
}

window.addEventListener('resize', resizeCallback);

resizeCallback();

export default view;
