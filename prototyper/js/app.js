/**
 * Main application controller
 * Manages dual state machines (iPad + Phone) and wires up autoplay + manual controls
 */
(function () {
  var ipadEl = document.getElementById('ipad-screen');
  var phoneEl = document.getElementById('phone-screen');
  var S = Screens;

  // Current state
  var kioskState = { screen: null, data: {} };
  var phoneState = { screen: null, data: {} };

  // --- Kiosk state machine ---
  function setKioskScreen(screen, data) {
    data = data || {};
    kioskState = { screen: screen, data: data };
    var html = '';

    switch (screen) {
      case 'skeleton':
        html = S.renderSkeleton();
        break;
      case 'product-grid':
        html = S.renderProductGrid();
        break;
      case 'qr-code':
        html = S.renderQRCode(data.product);
        break;
      case 'processing':
        html = S.renderProcessing(data.elapsed || 0);
        break;
      case 'result':
        html = S.renderTryOnResult(data.product, data.activeProductId);
        break;
      case 'checkout-select':
        html = S.renderCheckoutSelect(data.productName, data.productPrice);
        break;
      case 'checkout-confirm':
        html = S.renderCheckoutConfirm(data.method, data.productPrice);
        break;
      case 'checkout-processing':
        html = S.renderCheckoutProcessing(data.progress || 0, data.methodName);
        break;
      case 'checkout-success':
        html = S.renderCheckoutSuccess(data.method, data.productName, data.productPrice);
        break;
      default:
        html = S.renderProductGrid();
    }

    ipadEl.innerHTML = html;
    ipadEl.classList.add('fade-enter');
    setTimeout(function () { ipadEl.classList.remove('fade-enter'); }, 300);

    // Bind manual click events
    bindKioskEvents();
  }

  // --- Phone state machine ---
  function setPhoneScreen(screen, data) {
    data = data || {};
    phoneState = { screen: screen, data: data };
    var html = '';

    switch (screen) {
      case 'sleep':
        html = S.renderPhoneSleep();
        break;
      case 'upload':
        html = S.renderPhotoUpload(data.product);
        break;
      case 'uploading':
        html = S.renderUploading(data.progress || 0);
        break;
      case 'success':
        html = S.renderUploadSuccess();
        break;
      default:
        html = S.renderPhoneSleep();
    }

    phoneEl.innerHTML = html;
    phoneEl.classList.add('fade-enter');
    setTimeout(function () { phoneEl.classList.remove('fade-enter'); }, 300);
  }

  // --- Manual event bindings for kiosk screens ---
  function bindKioskEvents() {
    // Product grid: click product
    var productCards = ipadEl.querySelectorAll('[data-product]');
    productCards.forEach(function (card) {
      card.addEventListener('click', function () {
        var productId = card.getAttribute('data-product');
        var product = DemoData.PRODUCTS.find(function (p) { return p.id === productId; });
        if (product) {
          Autoplay.pause();
          setKioskScreen('qr-code', { product: product });
        }
      });
    });

    // QR screen: back button
    var backBtn = ipadEl.querySelector('[data-action="back"]');
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        setKioskScreen('product-grid');
        setPhoneScreen('sleep');
      });
    }

    // QR screen: simulate upload button
    var simUploadBtn = ipadEl.querySelector('[data-action="simulate-upload"]');
    if (simUploadBtn) {
      simUploadBtn.addEventListener('click', function () {
        var product = kioskState.data.product;
        // Show phone uploading
        setPhoneScreen('upload', { product: product });
        setTimeout(function () {
          setPhoneScreen('uploading', { progress: 0 });
          // Animate upload progress on phone
          var start = Date.now();
          var duration = 1500;
          function tick() {
            var elapsed = Date.now() - start;
            var p = Math.min((elapsed / duration) * 100, 100);
            var fill = phoneEl.querySelector('.upload-progress-fill');
            var txt = phoneEl.querySelector('.upload-progress-text');
            if (fill) fill.style.width = p + '%';
            if (txt) txt.textContent = '上傳中... ' + Math.round(p) + '%';
            if (p < 100) {
              requestAnimationFrame(tick);
            } else {
              setTimeout(function () {
                setPhoneScreen('success');
                setKioskScreen('processing', { elapsed: 0, product: product });
                // Auto-advance to result after 3 seconds
                setTimeout(function () {
                  if (kioskState.screen === 'processing') {
                    setKioskScreen('result', { product: product, activeProductId: product.id });
                  }
                }, 3000);
              }, 500);
            }
          }
          requestAnimationFrame(tick);
        }, 800);
      });
    }

    // Processing screen: skip button
    var skipBtn = ipadEl.querySelector('[data-action="skip-processing"]');
    if (skipBtn) {
      skipBtn.addEventListener('click', function () {
        var product = kioskState.data.product || DemoData.PRODUCTS[2];
        setKioskScreen('result', { product: product, activeProductId: product.id });
      });
    }

    // Result: buy button
    var buyBtn = ipadEl.querySelector('[data-action="checkout"]');
    if (buyBtn) {
      buyBtn.addEventListener('click', function () {
        var activeId = kioskState.data.activeProductId || (kioskState.data.product && kioskState.data.product.id);
        var product = DemoData.PRODUCTS.find(function (p) { return p.id === activeId; });
        if (product) {
          setKioskScreen('checkout-select', { productName: product.nameZh, productPrice: product.price });
        }
      });
    }

    // Result: restart button
    var restartBtn = ipadEl.querySelector('[data-action="restart"]');
    if (restartBtn) {
      restartBtn.addEventListener('click', function () {
        setKioskScreen('product-grid');
        setPhoneScreen('sleep');
      });
    }

    // Result: switch product
    var switchBtns = ipadEl.querySelectorAll('[data-switch-product]');
    switchBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var pid = btn.getAttribute('data-switch-product');
        if (pid !== kioskState.data.activeProductId) {
          setKioskScreen('result', {
            product: kioskState.data.product,
            activeProductId: pid
          });
        }
      });
    });

    // Checkout: payment method buttons
    var payBtns = ipadEl.querySelectorAll('[data-payment]');
    payBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var methodId = btn.getAttribute('data-payment');
        var method = DemoData.PAYMENT_METHODS.find(function (m) { return m.id === methodId; });
        if (method) {
          setKioskScreen('checkout-confirm', {
            method: method,
            productPrice: kioskState.data.productPrice
          });
        }
      });
    });

    // Checkout confirm: back to select
    var backSelect = ipadEl.querySelector('[data-action="back-to-select"]');
    if (backSelect) {
      backSelect.addEventListener('click', function () {
        setKioskScreen('checkout-select', kioskState.data);
      });
    }

    // Checkout confirm: back to result
    var backResult = ipadEl.querySelector('[data-action="back-to-result"]');
    if (backResult) {
      backResult.addEventListener('click', function () {
        setKioskScreen('result', { product: DemoData.PRODUCTS[2], activeProductId: DemoData.PRODUCTS[2].id });
      });
    }

    // Checkout confirm: pay button
    var payBtn = ipadEl.querySelector('[data-action="pay"]');
    if (payBtn) {
      payBtn.addEventListener('click', function () {
        var method = kioskState.data.method;
        setKioskScreen('checkout-processing', {
          progress: 0,
          methodName: method ? method.name : 'PayMe'
        });
        // Animate progress
        var start = Date.now();
        var duration = 3500;
        function tick() {
          var elapsed = Date.now() - start;
          var p = Math.min((elapsed / duration) * 100, 100);
          var fill = document.querySelector('.progress-bar-fill');
          var ring = document.querySelector('.progress-ring-svg circle');
          if (fill) fill.style.width = p + '%';
          if (ring) ring.setAttribute('stroke-dasharray', (p * 2.26).toFixed(1) + ' 226');
          if (p < 100) {
            requestAnimationFrame(tick);
          } else {
            setTimeout(function () {
              setKioskScreen('checkout-success', {
                method: method || DemoData.PAYMENT_METHODS[3],
                productName: kioskState.data.productName || '科大連帽衛衣 (金色)',
                productPrice: kioskState.data.productPrice || 450
              });
            }, 500);
          }
        }
        requestAnimationFrame(tick);
      });
    }

    // Checkout success: home button
    var homeBtn = ipadEl.querySelector('[data-action="home"]');
    if (homeBtn) {
      homeBtn.addEventListener('click', function () {
        setKioskScreen('product-grid');
        setPhoneScreen('sleep');
      });
    }
  }

  // --- Control bar bindings ---
  function initControls() {
    var btnPlayPause = document.getElementById('btn-play-pause');
    var btnSkip = document.getElementById('btn-skip');
    var btnReset = document.getElementById('btn-reset');
    var speedSelect = document.getElementById('ctrl-speed');

    if (btnPlayPause) {
      btnPlayPause.addEventListener('click', function () {
        Autoplay.togglePause();
      });
    }

    if (btnSkip) {
      btnSkip.addEventListener('click', function () {
        Autoplay.skip();
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', function () {
        Autoplay.reset(setKioskScreen, setPhoneScreen);
      });
    }

    if (speedSelect) {
      speedSelect.addEventListener('change', function () {
        Autoplay.setSpeed(parseFloat(this.value));
      });
    }
  }

  // --- Initialize ---
  function init() {
    initControls();
    // Start autoplay immediately
    Autoplay.start(setKioskScreen, setPhoneScreen);
  }

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
