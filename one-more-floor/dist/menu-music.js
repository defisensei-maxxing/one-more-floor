export function createMenuMusic(media, onError = () => {}) {
  media.loop = true;
  media.volume = 0.25;
  media.preload = 'none';
  let wanted = false;
  return {
    sync({ menu, muted, hidden }) {
      wanted = menu && !muted && !hidden;
      if (!wanted) { media.pause(); return; }
      const pending = media.play();
      pending?.then(() => { if (!wanted) media.pause(); }).catch(error => {
        if (wanted && error.name !== 'AbortError') onError(error);
      });
    }
  };
}
