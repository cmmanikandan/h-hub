const base = 'http://localhost:5000';

const payload = Buffer.from(JSON.stringify({
  id: 'admin-smoke',
  email: 'admin@hhub.com',
  name: 'ADMIN',
  role: 'admin'
})).toString('base64');

const token = `header.${payload}.signature`;
const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`
};

async function call(url, options = {}) {
  const response = await fetch(`${base}${url}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  return {
    ok: response.ok,
    status: response.status,
    data
  };
}

(async () => {
  const now = Date.now();
  const roomId = `GB-SMOKE-${now}`;
  const orderId = `ORD-SMOKE-${now}`;
  const productId = `PROD-SMOKE-${now}`;
  const riderId = 'RIDER-SMOKE';
  const sellerId = 'SELLER-SMOKE';
  const userId = 'USER-SMOKE';

  const out = [];

  out.push(['group-buy/create', await call('/api/innovations/group-buy/rooms', {
    method: 'POST',
    body: JSON.stringify({ roomId, productId, pincode: '600001', targetSize: 5, startPrice: 1200, minPrice: 900, createdBy: userId })
  })]);

  out.push(['group-buy/join', await call(`/api/innovations/group-buy/rooms/${roomId}/join`, {
    method: 'POST',
    body: JSON.stringify({ userId, userName: 'Smoke User' })
  })]);

  out.push(['delivery-missions/progress', await call('/api/innovations/delivery-missions/progress', {
    method: 'POST',
    body: JSON.stringify({ riderId, missionType: 'eco_route', increment: 1, target: 3, baseBonus: 100, savingsFactor: 1.2 })
  })]);

  out.push(['return-risk/score', await call('/api/innovations/return-risk/score', {
    method: 'POST',
    body: JSON.stringify({ userId, productId, sizeMismatchRisk: 40, imageMismatchRisk: 35, compatibilityRisk: 30, historicalReturnRate: 20, verifiedQualityAddon: true })
  })]);

  out.push(['verification-payment/hold', await call('/api/innovations/verification-payment/hold', {
    method: 'POST',
    body: JSON.stringify({ orderId, amount: 1299, holdReason: 'Smoke hold' })
  })]);

  out.push(['verification-payment/verify-otp', await call(`/api/innovations/verification-payment/${orderId}/verify-otp`, {
    method: 'POST',
    body: JSON.stringify({})
  })]);

  out.push(['verification-payment/upload-proof', await call(`/api/innovations/verification-payment/${orderId}/upload-proof`, {
    method: 'POST',
    body: JSON.stringify({ deliveryPhotoUrl: 'https://example.com/proof.jpg', unboxingHash: 'hash-smoke' })
  })]);

  out.push(['verification-payment/release', await call(`/api/innovations/verification-payment/${orderId}/release`, {
    method: 'POST',
    body: JSON.stringify({})
  })]);

  out.push(['seller-trust/recompute', await call(`/api/innovations/seller-trust/recompute/${sellerId}`, {
    method: 'POST',
    body: JSON.stringify({ onTimeDispatch: 90, complaintResolution: 88, returnHonesty: 91, packagingQuality: 89 })
  })]);

  out.push(['ai-negotiation/start', await call('/api/innovations/ai-negotiation/start', {
    method: 'POST',
    body: JSON.stringify({ userId, productId, basePrice: 1500, minPrice: 1100 })
  })]);

  const negotiationId = out[out.length - 1][1]?.data?.negotiation?.id;

  out.push(['ai-negotiation/counter', await call(`/api/innovations/ai-negotiation/${negotiationId}/counter`, {
    method: 'POST',
    body: JSON.stringify({ userOffer: 1200 })
  })]);

  out.push(['resell/create', await call('/api/innovations/resell/listings', {
    method: 'POST',
    body: JSON.stringify({ sellerUserId: userId, originalOrderId: orderId, productId, pincode: '600001', price: 799 })
  })]);

  out.push(['family-wallet/create', await call('/api/innovations/family-wallets', {
    method: 'POST',
    body: JSON.stringify({ ownerUserId: userId, walletName: 'Smoke Family', monthlyLimit: 20000, balance: 5000 })
  })]);

  const walletId = out[out.length - 1][1]?.data?.id;

  out.push(['family-wallet/link-member', await call(`/api/innovations/family-wallets/${walletId}/members`, {
    method: 'POST',
    body: JSON.stringify({ userId, role: 'owner', spendCap: 1000, categoryLocks: [] })
  })]);

  out.push(['family-wallet/spend-request', await call(`/api/innovations/family-wallets/${walletId}/spend-request`, {
    method: 'POST',
    body: JSON.stringify({ userId, amount: 100, category: '' })
  })]);

  out.push(['dispatch-map/upsert', await call('/api/innovations/dispatch-map/upsert', {
    method: 'POST',
    body: JSON.stringify({ orderId, routeConfidence: 88, delayProbability: 12, etaMinMinutes: 18, etaMaxMinutes: 30 })
  })]);

  out.push(['dispatch-map/get', await call(`/api/innovations/dispatch-map/${orderId}`)]);

  out.push(['insurance/claim', await call('/api/innovations/packaging-insurance/claim', {
    method: 'POST',
    body: JSON.stringify({ orderId, userId, premium: 49, beforePhotoUrl: 'https://example.com/before.jpg', afterPhotoUrl: 'https://example.com/after.jpg' })
  })]);

  out.push(['authenticity/record', await call('/api/innovations/authenticity/record', {
    method: 'POST',
    body: JSON.stringify({ productId, orderId, stage: 'seller_upload', actorId: sellerId, eventHash: `hash-${now}`, meta: { note: 'smoke' } })
  })]);

  out.push(['authenticity/get', await call(`/api/innovations/authenticity/${productId}`)]);

  out.push(['reverse-loyalty/award', await call('/api/innovations/reverse-loyalty/award', {
    method: 'POST',
    body: JSON.stringify({ userId, eventType: 'green_delivery_slot', pincode: '600001' })
  })]);

  out.push(['reverse-loyalty/get', await call(`/api/innovations/reverse-loyalty/${userId}`)]);

  const summary = out.map(([name, result]) => ({
    name,
    ok: result.ok,
    status: result.status,
    error: result.ok ? null : (result.data?.error || result.data)
  }));

  console.log(JSON.stringify(summary, null, 2));
})();
