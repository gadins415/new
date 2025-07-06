function installPassengerPWA() {
  const manifestPlaceholder = document.getElementById('manifest-placeholder');
  manifestPlaceholder.setAttribute('href', 'manifest-passenger.json');
  installPWA();
}

function installDriverPWA() {
  const manifestPlaceholder = document.getElementById('manifest-placeholder');
  manifestPlaceholder.setAttribute('href', 'manifest-driver.json');
  installPWA();
}

function installPWA() {
  let deferredPrompt;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        deferredPrompt = null;
      });
    }
  });
}

