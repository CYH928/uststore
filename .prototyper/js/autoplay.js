/**
 * Autoplay engine — orchestrates the demo walkthrough
 * Coordinates iPad (kiosk) and phone screens with simulated cursor
 */
var Autoplay = (function () {
  var cursor = null;
  var playing = true;
  var paused = false;
  var speed = 1;
  var currentStepIndex = 0;
  var aborted = false;
  var onSetKiosk = null;
  var onSetPhone = null;
  var timers = [];

  // Step definitions for the full demo
  var steps = [
    // 1. Show skeleton loading on iPad
    {
      label: '載入產品列表',
      run: function (done) {
        onSetKiosk('skeleton');
        onSetPhone('sleep');
        wait(1500, done);
      }
    },
    // 2. Show product grid
    {
      label: '顯示產品格',
      run: function (done) {
        onSetKiosk('product-grid');
        wait(2000, done);
      }
    },
    // 3. Move cursor to hoodie-gold and click
    {
      label: '選擇金色衛衣',
      run: function (done) {
        var target = document.querySelector('[data-product="hoodie-gold"]');
        if (!target) { done(); return; }
        showCursor();
        moveCursorTo(target, function () {
          clickEffect(target);
          wait(500, function () {
            onSetKiosk('qr-code', { product: DemoData.PRODUCTS[2] });
            hideCursor();
            done();
          });
        });
      }
    },
    // 4. Show QR code, wait
    {
      label: '顯示 QR Code',
      run: function (done) {
        showAnnotation('用戶使用手機掃描 QR Code', getIpadRect(), 'bottom');
        wait(2500, done);
      }
    },
    // 5. Phone wakes up — show upload page
    {
      label: '手機開啟上傳頁面',
      run: function (done) {
        hideAnnotation();
        onSetPhone('upload', { product: DemoData.PRODUCTS[2] });
        wait(2000, done);
      }
    },
    // 6. Phone: simulate photo selection
    {
      label: '手機選擇照片',
      run: function (done) {
        showAnnotation('用戶在手機上拍照...', getPhoneRect(), 'left');
        wait(1500, function () {
          hideAnnotation();
          onSetPhone('uploading', { progress: 0 });
          // Animate upload progress
          animateProgress(function (p) {
            var el = document.querySelector('.upload-progress-fill');
            var txt = document.querySelector('.upload-progress-text');
            if (el) el.style.width = p + '%';
            if (txt) txt.textContent = '上傳中... ' + Math.round(p) + '%';
          }, 2000, done);
        });
      }
    },
    // 7. Phone shows success, iPad transitions to processing
    {
      label: '上傳完成，開始處理',
      run: function (done) {
        onSetPhone('success');
        wait(800, function () {
          onSetKiosk('processing', { elapsed: 0 });
          done();
        });
      }
    },
    // 8. Processing animation with timer
    {
      label: 'AI 生成中...',
      run: function (done) {
        var elapsed = 0;
        var timerEl;
        var interval = setInterval(function () {
          if (paused) return;
          elapsed++;
          timerEl = document.querySelector('.processing-timer');
          if (timerEl) {
            var m = Math.floor(elapsed / 60);
            var s = elapsed % 60;
            timerEl.innerHTML = '<div class="gold-dot"></div> 已等候 ' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
          }
          if (elapsed >= 5) {
            clearInterval(interval);
            done();
          }
        }, 1000 / speed);
        timers.push(interval);
      }
    },
    // 9. Show try-on result
    {
      label: '顯示試穿結果',
      run: function (done) {
        onSetKiosk('result', { product: DemoData.PRODUCTS[2], activeProductId: DemoData.PRODUCTS[2].id });
        wait(3000, done);
      }
    },
    // 10. Click a different product in sidebar
    {
      label: '切換試穿款式',
      run: function (done) {
        var target = document.querySelector('[data-switch-product="windbreaker-red"]');
        if (!target) { done(); return; }
        showCursor();
        moveCursorTo(target, function () {
          clickEffect(target);
          wait(400, function () {
            hideCursor();
            onSetKiosk('result', { product: DemoData.PRODUCTS[2], activeProductId: 'windbreaker-red' });
            wait(2000, done);
          });
        });
      }
    },
    // 11. Click "Buy Now"
    {
      label: '點擊立即購買',
      run: function (done) {
        var target = document.querySelector('[data-action="checkout"]');
        if (!target) { done(); return; }
        showCursor();
        moveCursorTo(target, function () {
          clickEffect(target);
          wait(500, function () {
            hideCursor();
            var p = DemoData.PRODUCTS.find(function (x) { return x.id === 'windbreaker-red'; });
            onSetKiosk('checkout-select', { productName: p.nameZh, productPrice: p.price });
            onSetPhone('sleep');
            done();
          });
        });
      }
    },
    // 12. Select PayMe payment
    {
      label: '選擇 PayMe 付款',
      run: function (done) {
        wait(1500, function () {
          var target = document.querySelector('[data-payment="payme"]');
          if (!target) { done(); return; }
          showCursor();
          moveCursorTo(target, function () {
            clickEffect(target);
            wait(400, function () {
              hideCursor();
              var p = DemoData.PRODUCTS.find(function (x) { return x.id === 'windbreaker-red'; });
              onSetKiosk('checkout-confirm', { method: DemoData.PAYMENT_METHODS[3], productPrice: p.price });
              done();
            });
          });
        });
      }
    },
    // 13. Click pay button
    {
      label: '確認付款',
      run: function (done) {
        wait(2000, function () {
          var target = document.querySelector('[data-action="pay"]');
          if (!target) { done(); return; }
          showCursor();
          moveCursorTo(target, function () {
            clickEffect(target);
            wait(400, function () {
              hideCursor();
              // Start processing
              onSetKiosk('checkout-processing', { progress: 0, methodName: 'PayMe' });
              // Animate payment progress
              animateProgress(function (p) {
                var fill = document.querySelector('.progress-bar-fill');
                var ring = document.querySelector('.progress-ring-svg circle');
                if (fill) fill.style.width = p + '%';
                if (ring) ring.setAttribute('stroke-dasharray', (p * 2.26).toFixed(1) + ' 226');
              }, 3500, function () {
                wait(500, done);
              });
            });
          });
        });
      }
    },
    // 14. Payment success
    {
      label: '付款成功！',
      run: function (done) {
        var p = DemoData.PRODUCTS.find(function (x) { return x.id === 'windbreaker-red'; });
        onSetKiosk('checkout-success', { method: DemoData.PAYMENT_METHODS[3], productName: p.nameZh, productPrice: p.price });
        wait(4000, done);
      }
    },
    // 15. Click home → restart loop
    {
      label: '返回首頁',
      run: function (done) {
        var target = document.querySelector('[data-action="home"]');
        if (!target) { done(); return; }
        showCursor();
        moveCursorTo(target, function () {
          clickEffect(target);
          wait(500, function () {
            hideCursor();
            done();
          });
        });
      }
    },
  ];

  // --- Helpers ---
  function wait(ms, cb) {
    var adjustedMs = ms / speed;
    var t = setTimeout(function () {
      if (!aborted) cb();
    }, adjustedMs);
    timers.push(t);
  }

  function animateProgress(updateFn, durationMs, cb) {
    var dur = durationMs / speed;
    var start = Date.now();
    var frame;
    function tick() {
      if (aborted) return;
      if (paused) { frame = requestAnimationFrame(tick); return; }
      var elapsed = Date.now() - start;
      var p = Math.min((elapsed / dur) * 100, 100);
      updateFn(p);
      if (p < 100) {
        frame = requestAnimationFrame(tick);
      } else {
        cb();
      }
    }
    frame = requestAnimationFrame(tick);
  }

  function showCursor() {
    if (!cursor) cursor = document.getElementById('demo-cursor');
    if (cursor) cursor.classList.add('visible');
  }
  function hideCursor() {
    if (!cursor) cursor = document.getElementById('demo-cursor');
    if (cursor) cursor.classList.remove('visible');
  }

  function moveCursorTo(target, cb) {
    if (!cursor) cursor = document.getElementById('demo-cursor');
    if (!target || !cursor) { if (cb) cb(); return; }
    var rect = target.getBoundingClientRect();
    var x = rect.left + rect.width / 2 - 4;
    var y = rect.top + rect.height / 2 - 4;
    cursor.style.left = x + 'px';
    cursor.style.top = y + 'px';
    var dur = 800 / speed;
    cursor.style.transition = 'left ' + dur + 'ms cubic-bezier(0.4,0,0.2,1), top ' + dur + 'ms cubic-bezier(0.4,0,0.2,1), opacity 0.3s';
    wait(850, function () { if (cb) cb(); });
  }

  function clickEffect(target) {
    if (!target) return;
    if (cursor) cursor.classList.add('clicking');
    setTimeout(function () { if (cursor) cursor.classList.remove('clicking'); }, 150);
    // Ripple
    var rect = target.getBoundingClientRect();
    var ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = (rect.left + rect.width / 2 - 20) + 'px';
    ripple.style.top = (rect.top + rect.height / 2 - 20) + 'px';
    document.body.appendChild(ripple);
    setTimeout(function () { ripple.remove(); }, 600);
  }

  var annotationEl = null;
  function showAnnotation(text, refRect, position) {
    hideAnnotation();
    annotationEl = document.createElement('div');
    annotationEl.className = 'demo-annotation';
    annotationEl.textContent = text;
    document.body.appendChild(annotationEl);
    // Position
    if (refRect) {
      if (position === 'bottom') {
        annotationEl.style.left = (refRect.left + refRect.width / 2) + 'px';
        annotationEl.style.top = (refRect.bottom + 12) + 'px';
        annotationEl.style.transform = 'translateX(-50%)';
      } else if (position === 'left') {
        annotationEl.style.left = (refRect.left - 12) + 'px';
        annotationEl.style.top = (refRect.top + refRect.height / 2) + 'px';
        annotationEl.style.transform = 'translate(-100%, -50%)';
        annotationEl.querySelector('::after') // arrow adjust not needed for simple demo
      }
    }
  }
  function hideAnnotation() {
    if (annotationEl) { annotationEl.remove(); annotationEl = null; }
  }

  function getIpadRect() {
    var el = document.querySelector('.ipad-frame');
    return el ? el.getBoundingClientRect() : { left: 100, top: 100, width: 600, height: 400, bottom: 500 };
  }
  function getPhoneRect() {
    var el = document.querySelector('.phone-frame');
    return el ? el.getBoundingClientRect() : { left: 700, top: 100, width: 300, height: 600 };
  }

  // --- Control ---
  function updateStepDisplay() {
    var el = document.getElementById('ctrl-step');
    if (el) el.textContent = 'Step ' + (currentStepIndex + 1) + ' / ' + steps.length;
  }

  function runStep(index) {
    if (aborted) return;
    if (index >= steps.length) {
      // Loop back
      currentStepIndex = 0;
      updateStepDisplay();
      runStep(0);
      return;
    }
    currentStepIndex = index;
    updateStepDisplay();

    if (paused) {
      // Wait until unpaused
      var checkPause = setInterval(function () {
        if (!paused && !aborted) {
          clearInterval(checkPause);
          steps[index].run(function () { runStep(index + 1); });
        }
      }, 100);
      timers.push(checkPause);
      return;
    }

    steps[index].run(function () {
      runStep(index + 1);
    });
  }

  function start(setKioskFn, setPhoneFn) {
    onSetKiosk = setKioskFn;
    onSetPhone = setPhoneFn;
    cursor = document.getElementById('demo-cursor');
    aborted = false;
    paused = false;
    playing = true;
    currentStepIndex = 0;
    updateStepDisplay();
    runStep(0);
  }

  function pause() {
    paused = true;
    var btn = document.getElementById('btn-play-pause');
    if (btn) {
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg><span>播放</span>';
    }
  }

  function resume() {
    paused = false;
    var btn = document.getElementById('btn-play-pause');
    if (btn) {
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/></svg><span>暫停</span>';
    }
  }

  function togglePause() {
    if (paused) resume(); else pause();
  }

  function skip() {
    // Abort current step and advance
    aborted = true;
    timers.forEach(function (t) { clearTimeout(t); clearInterval(t); });
    timers = [];
    hideCursor();
    hideAnnotation();
    setTimeout(function () {
      aborted = false;
      var next = currentStepIndex + 1;
      if (next >= steps.length) next = 0;
      runStep(next);
    }, 100);
  }

  function reset(setKioskFn, setPhoneFn) {
    aborted = true;
    timers.forEach(function (t) { clearTimeout(t); clearInterval(t); });
    timers = [];
    hideCursor();
    hideAnnotation();
    setTimeout(function () {
      start(setKioskFn || onSetKiosk, setPhoneFn || onSetPhone);
    }, 100);
  }

  function setSpeed(s) {
    speed = s;
  }

  return {
    start: start,
    pause: pause,
    resume: resume,
    togglePause: togglePause,
    skip: skip,
    reset: reset,
    setSpeed: setSpeed,
    getSteps: function () { return steps; },
  };
})();
