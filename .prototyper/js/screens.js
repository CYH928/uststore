/**
 * Screen rendering functions for all Kiosk (8) + Mobile (4) screens
 * Each function returns an HTML string
 */
var Screens = (function () {
  var D = DemoData;
  var I = Icons;

  // ============================================
  // QR Code SVG (pre-rendered, simplified)
  // ============================================
  function qrCodeSVG() {
    // A simplified QR-like pattern as SVG
    var size = 200;
    var cells = 25;
    var cellSize = size / cells;
    // Deterministic pseudo-QR pattern
    var pattern = [
      "1111111001011010011111111",
      "1000001010100100101000001",
      "1011101001010010101011101",
      "1011101011001100101011101",
      "1011101001110011001011101",
      "1000001010101010101000001",
      "1111111010101010111111111",
      "0000000011100110100000000",
      "1011011100011001011010011",
      "0101100010110101100110100",
      "1100011101001010111001011",
      "0110100011010100010110100",
      "1010111100101011101001011",
      "0011000010010101001010100",
      "1100111101101010110011011",
      "0101000010011100010100100",
      "1011011100100011011010111",
      "0000000010101000100010100",
      "1111111010001010101010011",
      "1000001001010101100110100",
      "1011101011100011011001111",
      "1011101001011100010100010",
      "1011101010010010110011011",
      "1000001010100101001010100",
      "1111111011001010111010011",
    ];
    var rects = '';
    for (var r = 0; r < cells; r++) {
      for (var c = 0; c < cells; c++) {
        if (pattern[r] && pattern[r][c] === '1') {
          rects += '<rect x="' + (c * cellSize) + '" y="' + (r * cellSize) + '" width="' + cellSize + '" height="' + cellSize + '" fill="#003366"/>';
        }
      }
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' + rects + '</svg>';
  }

  // ============================================
  // KIOSK SCREEN 1: Skeleton Loading
  // ============================================
  function renderSkeleton() {
    var cards = '';
    for (var i = 0; i < 5; i++) {
      cards += '<div class="skeleton-card">' +
        '<div class="skeleton-img"></div>' +
        '<div class="skeleton-body">' +
        '<div class="skeleton-line"></div>' +
        '<div class="skeleton-line short"></div>' +
        '</div></div>';
    }
    return '<div class="skeleton-grid">' + cards + '</div>';
  }

  // ============================================
  // KIOSK SCREEN 1: Product Grid
  // ============================================
  function renderProductGrid() {
    var cards = '';
    D.PRODUCTS.forEach(function (p) {
      cards += '<button class="product-card" data-product="' + p.id + '">' +
        '<div class="product-card-img"><img src="' + p.image + '" alt="' + p.nameZh + '"></div>' +
        '<div class="product-card-body">' +
        '<div class="product-card-name">' + p.nameZh + '</div>' +
        '<div class="product-card-footer">' +
        '<span class="product-card-price">HK$' + p.price + '</span>' +
        '<span class="product-card-btn">試穿</span>' +
        '</div></div></button>';
    });
    return '<div class="product-grid">' + cards + '</div>';
  }

  // ============================================
  // KIOSK SCREEN 2: QR Code
  // ============================================
  function renderQRCode(product) {
    if (!product) product = D.PRODUCTS[2]; // default hoodie-gold
    return '<div class="qr-screen">' +
      '<button class="qr-back" data-action="back">' + I.arrowLeft(16) + ' 返回</button>' +
      '<div class="qr-main">' +
      // Left: product card
      '<div class="qr-product-card"><div class="qr-product-inner">' +
      '<div class="qr-product-img"><img src="' + product.image + '" alt="' + product.nameZh + '"></div>' +
      '<div class="qr-product-info">' +
      '<h2>' + product.nameZh + '</h2>' +
      '<p class="price">HK$' + product.price + '</p>' +
      '</div></div></div>' +
      // Right: QR code
      '<div class="qr-code-card"><div class="qr-code-inner">' +
      '<div class="qr-code-box">' + qrCodeSVG() + '</div>' +
      '<div class="qr-scan-label">' + I.scanLine(20) + '<span>用手機掃描 QR Code</span></div>' +
      '<p class="qr-scan-subtitle">上傳你的照片進行虛擬試穿</p>' +
      '<div class="qr-waiting"><div class="pulse-dot"></div> 等待照片中...</div>' +
      '<button class="btn-simulate-upload" data-action="simulate-upload">模擬上傳照片 →</button>' +
      '</div></div>' +
      '</div>' +
      // Steps
      '<div class="qr-steps">' +
      '<div class="qr-step">' +
      '<div class="qr-step-icon active">' + I.smartphone(20) + '</div>' +
      '<p class="qr-step-label active">掃描 QR Code</p></div>' +
      '<div class="qr-step-line"></div>' +
      '<div class="qr-step">' +
      '<div class="qr-step-icon inactive">' + I.upload(20) + '</div>' +
      '<p class="qr-step-label inactive">上傳照片</p></div>' +
      '<div class="qr-step-line"></div>' +
      '<div class="qr-step">' +
      '<div class="qr-step-icon inactive">' + I.sparkles(20) + '</div>' +
      '<p class="qr-step-label inactive">查看效果</p></div>' +
      '</div></div>';
  }

  // ============================================
  // KIOSK SCREEN 3: Processing
  // ============================================
  function renderProcessing(elapsed) {
    var mins = Math.floor((elapsed || 0) / 60);
    var secs = (elapsed || 0) % 60;
    var timeStr = (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;

    return '<div class="processing-screen">' +
      '<div class="processing-timer"><div class="gold-dot"></div> 已等候 ' + timeStr + '</div>' +
      '<div class="spinner-container">' +
      '<div class="spinner-bg"></div>' +
      '<div class="spinner-outer"></div>' +
      '<div class="spinner-inner"></div>' +
      '<div class="spinner-icon">' + I.shirt(40) + '</div>' +
      '</div>' +
      '<div class="processing-title">正在為您生成虛擬試穿效果...</div>' +
      '<div class="processing-subtitle">通常需要約 30 秒</div>' +
      '<button class="btn-skip-processing" data-action="skip-processing">跳過等待 →</button>' +
      '<div class="bounce-dots"><span></span><span></span><span></span></div>' +
      '</div>';
  }

  // ============================================
  // KIOSK SCREEN 4: Try-On Result
  // ============================================
  function renderTryOnResult(product, activeProductId) {
    if (!product) product = D.PRODUCTS[2];
    if (!activeProductId) activeProductId = product.id;

    var sidebarItems = '';
    D.PRODUCTS.forEach(function (p) {
      var isCurrent = p.id === activeProductId;
      var cls = 'sidebar-product' + (isCurrent ? ' current' : '');
      sidebarItems += '<button class="' + cls + '" data-switch-product="' + p.id + '">' +
        '<div class="sidebar-product-thumb"><img src="' + p.image + '" alt="' + p.nameZh + '"></div>' +
        '<div class="sidebar-product-info">' +
        '<div class="sidebar-product-name">' + p.nameZh + '</div>' +
        '<div class="sidebar-product-meta">' +
        '<span class="sidebar-product-price">HK$' + p.price + '</span>' +
        (isCurrent ? '' : '<span class="sidebar-product-status"><span class="check">' + I.check(12) + '</span></span>') +
        '</div></div>' +
        (isCurrent ? '<div class="sidebar-product-indicator"></div>' : '') +
        '</button>';
    });

    var activeProduct = D.PRODUCTS.find(function (p) { return p.id === activeProductId; }) || product;

    return '<div class="result-screen">' +
      '<div class="result-main">' +
      '<div class="result-image-wrap">' +
      '<img class="result-photo" src="' + activeProduct.resultImage + '" alt="Virtual Try-On Result">' +
      '</div></div>' +
      '<div class="result-sidebar">' +
      '<div class="result-sidebar-header">' +
      '<div class="name">' + activeProduct.nameZh + '</div>' +
      '<div class="price">HK$' + activeProduct.price + '</div>' +
      '<div class="result-sidebar-actions">' +
      '<button class="btn-buy" data-action="checkout">' + I.shoppingBag(16) + ' 立即購買</button>' +
      '<button class="btn-restart" data-action="restart">' + I.refreshCw(12) + ' 重新開始</button>' +
      '</div></div>' +
      '<div class="result-sidebar-list-header">試穿其他款式</div>' +
      '<div class="result-sidebar-list">' + sidebarItems + '</div>' +
      '</div></div>';
  }

  // ============================================
  // KIOSK SCREEN 5: Checkout — Select Payment
  // ============================================
  function renderCheckoutSelect(productName, productPrice) {
    productName = productName || '科大連帽衛衣 (金色)';
    productPrice = productPrice || 450;

    var methods = '';
    D.PAYMENT_METHODS.forEach(function (m) {
      var bgAlpha = '0.05';
      var borderAlpha = '0.2';
      methods += '<button class="payment-btn" data-payment="' + m.id + '" ' +
        'style="background:' + m.color + '0D;border-color:' + m.color + '33;' +
        'hover:background:' + m.color + '1A">' +
        '<span class="icon">' + m.icon + '</span>' +
        '<span class="label" style="color:' + m.color + '">' + m.name + '</span>' +
        '</button>';
    });

    return '<div class="checkout-screen bg-white">' +
      '<div class="checkout-inner">' +
      '<button class="checkout-back" data-action="back-to-result">' + I.chevronLeft(16) + ' 返回試穿結果</button>' +
      '<div class="order-summary"><div class="order-summary-row">' +
      '<div><p class="order-summary-label">商品</p><p class="order-summary-value">' + productName + '</p></div>' +
      '<div style="text-align:right"><p class="order-summary-label">應付金額</p><p class="order-summary-price">HK$' + productPrice + '</p></div>' +
      '</div></div>' +
      '<div class="payment-methods-title">選擇付款方式</div>' +
      '<div class="payment-grid">' + methods + '</div>' +
      '<p class="checkout-disclaimer">🔒 此為 POC 示範，不會產生實際交易</p>' +
      '</div></div>';
  }

  // ============================================
  // KIOSK SCREEN 6: Checkout — Confirm
  // ============================================
  function renderCheckoutConfirm(method, productPrice) {
    if (!method) method = D.PAYMENT_METHODS[3]; // PayMe
    productPrice = productPrice || 450;
    var isCard = method.id === 'visa' || method.id === 'mastercard';

    var formContent;
    if (isCard) {
      formContent = '<div class="form-group">' +
        '<label class="form-label">卡號</label>' +
        '<div class="form-input-icon">' +
        '<span style="color:' + method.color + '">' + I.creditCard(20) + '</span>' +
        '<input type="text" value="' + method.cardNumber + '" readonly>' +
        '</div></div>' +
        '<div class="form-row">' +
        '<div class="form-group"><label class="form-label">到期日</label>' +
        '<input class="form-input" type="text" value="' + method.cardExpiry + '" readonly></div>' +
        '<div class="form-group cvv"><label class="form-label">CVV</label>' +
        '<input class="form-input" type="text" value="' + method.cardCvv + '" readonly></div>' +
        '</div>' +
        '<div class="form-group"><label class="form-label">持卡人姓名</label>' +
        '<input class="form-input" type="text" value="HKUST DEMO USER" readonly style="font-family:inherit"></div>';
    } else {
      formContent = '<div class="mobile-payment-confirm">' +
        '<div class="mobile-payment-icon" style="background:' + method.color + '15">' +
        '<span style="color:' + method.color + '">' + I.smartphone(32) + '</span></div>' +
        '<div style="text-align:center"><p class="mobile-payment-name">' + method.name + ' 快捷支付</p>' +
        '<p class="mobile-payment-sub">點擊下方按鈕確認付款</p></div>' +
        '<div class="mobile-payment-account"><p class="label">帳戶</p>' +
        '<p class="value">**** **** 8888</p></div></div>';
    }

    return '<div class="checkout-screen bg-white">' +
      '<div class="checkout-inner">' +
      '<button class="checkout-back" data-action="back-to-select">' + I.chevronLeft(16) + ' 選擇其他付款方式</button>' +
      '<div class="checkout-card">' +
      '<div class="checkout-card-header">' +
      '<div class="checkout-card-header-left">' +
      '<span class="icon">' + method.icon + '</span>' +
      '<div><p class="name">' + method.name + '</p><p class="sub">安全支付</p></div>' +
      '</div>' +
      '<div class="checkout-card-header-right">' +
      '<p class="label">應付金額</p><p class="amount">HK$' + productPrice + '</p>' +
      '</div></div>' +
      '<div class="checkout-card-body">' + formContent +
      '<div class="checkout-security">' + I.shieldCheck(14) + ' 此為示範交易，不會產生實際扣款</div>' +
      '</div>' +
      '<div class="checkout-card-footer">' +
      '<button class="btn-pay" data-action="pay" style="background:' + method.color + '">確認付款 HK$' + productPrice + '</button>' +
      '</div></div></div></div>';
  }

  // ============================================
  // KIOSK SCREEN 7: Checkout — Processing
  // ============================================
  function renderCheckoutProcessing(progress, methodName) {
    progress = progress || 0;
    methodName = methodName || 'PayMe';
    var dashVal = (progress * 2.26).toFixed(1);

    return '<div class="checkout-screen bg-white">' +
      '<div class="checkout-processing">' +
      '<div class="progress-ring-wrap">' +
      '<div class="progress-ring-bg"></div>' +
      '<svg class="progress-ring-svg" viewBox="0 0 80 80">' +
      '<circle cx="40" cy="40" r="36" fill="none" stroke="#003366" stroke-width="4" stroke-linecap="round" stroke-dasharray="' + dashVal + ' 226" style="transition:stroke-dasharray 0.1s"/>' +
      '</svg>' +
      '<div class="progress-ring-icon">' + I.shieldCheck(32) + '</div>' +
      '</div>' +
      '<div style="text-align:center">' +
      '<h3 style="font-size:20px;font-weight:700;color:var(--gray-800)">正在處理付款</h3>' +
      '<p style="font-size:14px;color:var(--gray-400);margin-top:8px">請稍候，正在驗證您的付款...</p>' +
      '</div>' +
      '<div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:' + progress + '%"></div></div>' +
      '<div class="processing-comm">' + I.loader2(12) + ' 與 ' + methodName + ' 通訊中...</div>' +
      '</div></div>';
  }

  // ============================================
  // KIOSK SCREEN 8: Checkout — Success
  // ============================================
  function renderCheckoutSuccess(method, productName, productPrice) {
    if (!method) method = D.PAYMENT_METHODS[3];
    productName = productName || '科大連帽衛衣 (金色)';
    productPrice = productPrice || 450;
    var txnId = 'TXN-A3B8C2D1';

    return '<div class="checkout-screen bg-green">' +
      '<div class="success-container">' +
      '<div class="success-icon-wrap">' +
      '<div class="success-icon">' + I.check(48) + '</div>' +
      '<div class="success-ping"></div>' +
      '</div>' +
      '<div class="success-title">付款成功！</div>' +
      '<div class="success-subtitle">感謝您的購買，祝您有愉快的一天</div>' +
      '<div class="receipt-card">' +
      '<div class="receipt-row"><span class="receipt-label">商品</span><span class="receipt-value">' + productName + '</span></div>' +
      '<div class="receipt-row"><span class="receipt-label">付款方式</span><span class="receipt-value">' + method.icon + ' ' + method.name + '</span></div>' +
      '<div class="receipt-divider"></div>' +
      '<div class="receipt-row"><span class="receipt-label" style="font-weight:600">合計</span><span class="receipt-total">HK$' + productPrice + '</span></div>' +
      '<div class="receipt-txn">' + I.shieldCheck(16) + ' 交易編號: ' + txnId + '</div>' +
      '</div>' +
      '<button class="btn-home" data-action="home">返回首頁</button>' +
      '</div></div>';
  }

  // ============================================
  // MOBILE SCREEN 1: Sleep
  // ============================================
  function renderPhoneSleep() {
    return '<div class="phone-sleep"></div>';
  }

  // ============================================
  // MOBILE SCREEN 2: Photo Upload
  // ============================================
  function renderPhotoUpload(product) {
    if (!product) product = D.PRODUCTS[2];
    return '<div class="mobile-screen-wrap">' +
      '<div class="mobile-header">' +
      '<img src="https://souvenir.hkust.edu.hk/image/HKUST-Chi.svg" alt="HKUST" style="height:20px">' +
      '<span class="sep">|</span>' +
      '<img src="https://souvenir.hkust.edu.hk/image/Souvenir-Shop-Chi.svg" alt="Shop" style="height:14px">' +
      '</div>' +
      '<div class="upload-screen">' +
      '<div class="upload-product-info">' +
      '<div class="upload-product-thumb"><img src="' + product.image + '" alt=""></div>' +
      '<div><div class="upload-product-name">' + product.nameZh + '</div>' +
      '<div class="upload-product-price">HK$' + product.price + '</div></div>' +
      '</div>' +
      '<div class="upload-drop-zone">' + I.upload(40) +
      '<p class="text">拖放或 Ctrl+V 貼上照片</p></div>' +
      '<div class="upload-divider">或</div>' +
      '<button class="btn-camera">' + I.camera(20) + ' 拍照</button>' +
      '<button class="btn-gallery">' + I.imagePlus(20) + ' 從相簿選擇</button>' +
      '</div></div>';
  }

  // ============================================
  // MOBILE SCREEN 3: Uploading
  // ============================================
  function renderUploading(progress) {
    progress = progress || 0;
    return '<div class="mobile-screen-wrap">' +
      '<div class="mobile-header">' +
      '<img src="https://souvenir.hkust.edu.hk/image/HKUST-Chi.svg" alt="HKUST" style="height:20px">' +
      '<span class="sep">|</span>' +
      '<img src="https://souvenir.hkust.edu.hk/image/Souvenir-Shop-Chi.svg" alt="Shop" style="height:14px">' +
      '</div>' +
      '<div class="upload-progress-wrap">' +
      '<div class="upload-preview"><img src="' + D.PERSON_IMAGE + '" alt="Photo" class="preview-photo"></div>' +
      '<div class="upload-progress-bar"><div class="upload-progress-fill" style="width:' + progress + '%"></div></div>' +
      '<div class="upload-progress-text">上傳中... ' + Math.round(progress) + '%</div>' +
      '</div></div>';
  }

  // ============================================
  // MOBILE SCREEN 4: Upload Success
  // ============================================
  function renderUploadSuccess() {
    return '<div class="mobile-screen-wrap">' +
      '<div class="mobile-header">' +
      '<img src="https://souvenir.hkust.edu.hk/image/HKUST-Chi.svg" alt="HKUST" style="height:20px">' +
      '<span class="sep">|</span>' +
      '<img src="https://souvenir.hkust.edu.hk/image/Souvenir-Shop-Chi.svg" alt="Shop" style="height:14px">' +
      '</div>' +
      '<div class="mobile-success">' +
      '<div class="mobile-success-icon">' + I.checkCircle(40) + '</div>' +
      '<h2>照片已上傳成功！</h2>' +
      '<div class="mobile-success-box">' +
      I.monitor(40) +
      '<p class="title">請回到店內大螢幕</p>' +
      '<p class="sub">查看試穿效果</p>' +
      '<div class="ai-status"><div class="dot"></div> AI 正在生成試穿效果...</div>' +
      '</div>' +
      '<p class="close-hint">你可以關閉此頁面</p>' +
      '</div></div>';
  }

  // Public API
  return {
    renderSkeleton: renderSkeleton,
    renderProductGrid: renderProductGrid,
    renderQRCode: renderQRCode,
    renderProcessing: renderProcessing,
    renderTryOnResult: renderTryOnResult,
    renderCheckoutSelect: renderCheckoutSelect,
    renderCheckoutConfirm: renderCheckoutConfirm,
    renderCheckoutProcessing: renderCheckoutProcessing,
    renderCheckoutSuccess: renderCheckoutSuccess,
    renderPhoneSleep: renderPhoneSleep,
    renderPhotoUpload: renderPhotoUpload,
    renderUploading: renderUploading,
    renderUploadSuccess: renderUploadSuccess,
  };
})();
