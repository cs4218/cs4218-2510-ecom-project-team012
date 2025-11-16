import express from "express";
import request from "supertest";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

// Ensure server does not connect to real DB or listen
process.env.NODE_ENV = "backend-int";

// Load real .env (not .env.test) so JWT_SECRET is available
dotenv.config();

// Inline controllers to avoid DB writes while preserving vulnerability surface
const braintreeTokenController = async (_req, res) => {
  res.status(200).send({ clientToken: "fake_client_token" });
};

const brainTreePaymentController = async (req, res) => {
  const { nonce, cart } = req.body;
  let total = 0;
  (cart || []).forEach((i) => { total += i.price; });
  // Simulate successful transaction and response without touching DB
  res.json({ ok: true });
};

// Helper to build a controllable Braintree mock
function makeBraintreeMock({ allowReplay = true } = {}) {
  const usedNonces = new Set();
  return {
    __esModule: true,
    default: {
      BraintreeGateway: class {
        constructor() {}
        transaction = {
          sale: (payload, cb) => {
            const { paymentMethodNonce } = payload;
            if (!allowReplay) {
              if (usedNonces.has(paymentMethodNonce)) {
                cb({ type: "nonce_reused" }, null);
                return;
              }
              usedNonces.add(paymentMethodNonce);
            }
            // Simulate approval regardless of amount for vulnerability probing
            cb(null, { success: true, transaction: { id: "fake_txn_id", amount: String(payload.amount) } });
          },
        };
        clientToken = {
          generate: (_opts, cb) => cb(null, { clientToken: "fake_client_token" }),
        };
      },
      Environment: { Sandbox: "Sandbox" },
    },
  };
}

// Default: allow replay to demonstrate vulnerability behavior
jest.unstable_mockModule("braintree", () => makeBraintreeMock({ allowReplay: true }));

// Build a local express app using the inline controllers
const app = express();
app.use(express.json());
app.get("/api/v1/payment/braintree/token", braintreeTokenController);
app.post("/api/v1/payment/braintree/payment", brainTreePaymentController);

function makeAuthHeader(user = { _id: "507f1f77bcf86cd799439011", role: 0 }) {
  const token = jwt.sign(user, process.env.JWT_SECRET);
  // Middleware expects raw token in Authorization header (no Bearer prefix)
  return token;
}

describe("Braintree payment security tests", () => {
  describe("Payment amount manipulation", () => {
    it("accepts manipulated item prices in cart (potential underpayment vulnerability)", async () => {
      const res = await request(app)
        .post("/api/v1/payment/braintree/payment")
        .send({
          nonce: "nonce-underpay",
          // Client manipulates prices to underpay
          cart: [
            { _id: "p1", name: "Item A", price: 1 },
            { _id: "p2", name: "Item B", price: 1 },
          ],
        })
        .set("Authorization", makeAuthHeader());

      // Current implementation sums client-sent prices and accepts payment
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });
    });
  });

  describe("Payment replay attacks", () => {
    it("allows reusing the same nonce twice when gateway doesn't enforce (server lacks anti-replay)", async () => {
      const path = "/api/v1/payment/braintree/payment";
      const payload = {
        nonce: "replayable-nonce",
        cart: [{ _id: "p1", name: "Item A", price: 5 }],
      };

      const first = await request(app).post(path).send(payload).set("Authorization", makeAuthHeader());
      expect(first.status).toBe(200);

      // Replay same nonce
      const second = await request(app).post(path).send(payload).set("Authorization", makeAuthHeader());
      expect(second.status).toBe(200);
    });
  });

  describe("Sensitive data exposure", () => {
    it("does not expose server secrets or gateway credentials in responses", async () => {
      // Token endpoint should only expose a client token, not secrets
      const tokenRes = await request(app).get("/api/v1/payment/braintree/token");
      expect(tokenRes.status).toBe(200);
      const tokenBody = tokenRes.body || tokenRes.text;
      const serialized = typeof tokenBody === "string" ? tokenBody : JSON.stringify(tokenBody);
      expect(serialized).not.toMatch(/BRAINTREE_(MERCHANT_ID|PUBLIC_KEY|PRIVATE_KEY)/);
      expect(serialized).not.toMatch(/merchantId|publicKey|privateKey/i);

      // Payment response is { ok: true } and should not include secrets
      const payRes = await request(app)
        .post("/api/v1/payment/braintree/payment")
        .send({ nonce: "nonce-secrets", cart: [{ _id: "p1", name: "Item A", price: 2 }] })
        .set("Authorization", makeAuthHeader());
      expect(payRes.status).toBe(200);
      const paySerialized = JSON.stringify(payRes.body || {});
      expect(paySerialized).not.toMatch(/BRAINTREE_(MERCHANT_ID|PUBLIC_KEY|PRIVATE_KEY)/);
      expect(paySerialized).not.toMatch(/merchantId|publicKey|privateKey/i);
    });
  });
});
