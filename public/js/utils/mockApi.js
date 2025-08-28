// Fake async helpers (delays + upload simulation)

export function delay(min = 800, max = 1200) {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(res => setTimeout(res, ms));
}

export function simulateFileUpload({ onProgress }) {
  let progress = 0;
  let cancelled = false;

  const tick = () => {
    if (cancelled) return;
    const inc = Math.floor(Math.random() * 18) + 7; // +7..+24
    progress = Math.min(100, progress + inc);
    if (typeof onProgress === 'function') onProgress(progress);
    if (progress < 100) {
      setTimeout(tick, Math.floor(Math.random() * 250) + 120);
    }
  };

  const promise = new Promise((resolve) => {
    const start = () => {
      setTimeout(() => {
        tick();
        const watcher = setInterval(() => {
          if (cancelled) { clearInterval(watcher); }
          if (progress >= 100) {
            clearInterval(watcher);
            resolve();
          }
        }, 60);
      }, Math.floor(Math.random() * 200) + 80);
    };
    start();
  });

  return {
    cancel: () => { cancelled = true; },
    promise
  };
}
