# Innovation Features API (v1 Foundation)

Base URL: `http://localhost:5000`
Namespace: `/api/innovations/*`

## 1) Hyperlocal Group Buy

- `POST /api/innovations/group-buy/rooms`
- `GET /api/innovations/group-buy/rooms?pincode=600001&productId=...`
- `POST /api/innovations/group-buy/rooms/:roomId/join`

## 2) Delivery-to-Earn Missions

- `POST /api/innovations/delivery-missions/progress`
- `GET /api/innovations/delivery-missions/:riderId`

## 3) Return Risk Score + Smart Prevention

- `POST /api/innovations/return-risk/score`

## 4) Buy Now, Pay After Delivery Verification

- `POST /api/innovations/verification-payment/hold`
- `POST /api/innovations/verification-payment/:orderId/verify-otp`
- `POST /api/innovations/verification-payment/:orderId/upload-proof`
- `POST /api/innovations/verification-payment/:orderId/release`

## 5) Community Trust Layers for Sellers

- `POST /api/innovations/seller-trust/recompute/:sellerId`
- `GET /api/innovations/seller-trust/:sellerId`

## 6) AI Negotiation Mode for Repeat Buyers

- `POST /api/innovations/ai-negotiation/start`
- `POST /api/innovations/ai-negotiation/:id/counter`

## 7) Neighborhood Resell Loop

- `POST /api/innovations/resell/listings`
- `GET /api/innovations/resell/listings?pincode=...`

## 8) Family Wallet + Spending Controls

- `POST /api/innovations/family-wallets`
- `POST /api/innovations/family-wallets/:walletId/members`
- `POST /api/innovations/family-wallets/:walletId/spend-request`

## 9) Live Dispatch Map for Buyers

- `POST /api/innovations/dispatch-map/upsert`
- `GET /api/innovations/dispatch-map/:orderId`

## 10) Damage-Proof Packaging Insurance

- `POST /api/innovations/packaging-insurance/quote`
- `POST /api/innovations/packaging-insurance/claim`

## 11) Product Authenticity Chain (Lightweight)

- `POST /api/innovations/authenticity/record`
- `GET /api/innovations/authenticity/:productId`

## 12) Reverse Loyalty

- `POST /api/innovations/reverse-loyalty/award`
- `GET /api/innovations/reverse-loyalty/:userId`

## Health check

- `GET /api/innovations/health`

---

## Quick Example: Group Buy Room Create

```json
POST /api/innovations/group-buy/rooms
{
  "roomId": "GB-MOB-101",
  "productId": "prod_abc",
  "pincode": "600001",
  "targetSize": 20,
  "startPrice": 15999,
  "minPrice": 14699,
  "createdBy": "user_123"
}
```

## Notes

- This is a **v1 foundation**. It includes persistence + baseline scoring logic.
- You can now build frontend dashboards/workflows on top of these APIs.
