/**
 * Mock data for Prototyper demo
 * Source: scripts/seed-firestore.ts + checkout/page.tsx
 */
var DemoData = (function () {
  var PRODUCTS = [
    { id: "campus-crewneck-cream", name: "Campus Skyline Crewneck", nameZh: "校園圖案羅紋衛衣", price: 380, image: "assets/products/campus-crewneck-cream.png", resultImage: "assets/results/campus-crewneck-cream.png" },
    { id: "typography-crewneck-navy", name: "Typography Crewneck - Navy", nameZh: "科大羅紋衛衣", price: 380, image: "assets/products/typography-crewneck-navy.png", resultImage: "assets/results/typography-crewneck-navy.png" },
    { id: "hoodie-gold", name: "HKUST Hoodie - Gold", nameZh: "科大連帽衛衣 (金色)", price: 450, image: "assets/products/hoodie-gold.png", resultImage: "assets/results/hoodie-gold.png" },
    { id: "hoodie-navy", name: "HKUST Hoodie - Navy", nameZh: "科大連帽衛衣 (深藍色)", price: 450, image: "assets/products/hoodie-navy.png", resultImage: "assets/results/hoodie-navy.png" },
    { id: "windbreaker-red", name: "UST Windbreaker - Red", nameZh: "科大校友設計皮膚風衣", price: 520, image: "assets/products/windbreaker-red.png", resultImage: "assets/results/windbreaker-red.png" },
  ];

  var PERSON_IMAGE = "assets/human.png";

  var PAYMENT_METHODS = [
    { id: "visa", name: "Visa", icon: "💳", color: "#1A1F71", cardNumber: "4242 8888 1234 5678", cardExpiry: "12/28", cardCvv: "123" },
    { id: "mastercard", name: "Mastercard", icon: "💳", color: "#EB001B", cardNumber: "5425 2334 3010 9903", cardExpiry: "06/27", cardCvv: "456" },
    { id: "alipay", name: "支付寶 AlipayHK", icon: "🅰️", color: "#1677FF" },
    { id: "payme", name: "PayMe", icon: "📱", color: "#DB0011" },
    { id: "wechatpay", name: "WeChat Pay", icon: "💬", color: "#07C160" },
    { id: "octopus", name: "八達通 Octopus", icon: "🐙", color: "#F58220" },
  ];

  var MODELS = [
    { id: "virtual-try-on-001", name: "Virtual Try-On 001" },
    { id: "gemini-2.5-flash-image", name: "Nano Banana 2" },
  ];

  return {
    PRODUCTS: PRODUCTS,
    PAYMENT_METHODS: PAYMENT_METHODS,
    MODELS: MODELS,
    PERSON_IMAGE: PERSON_IMAGE,
  };
})();
