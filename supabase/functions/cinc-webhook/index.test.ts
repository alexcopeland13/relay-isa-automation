
import {
  assertEquals,
  assertExists,
  assertNotEquals,
  assertObjectMatch,
} from "https://deno.land/std@0.224.0/assert/mod.ts"; // Using a more recent std version
import { stub, spy } from "https://deno.land/std@0.224.0/testing/mock.ts";
import * as supabaseJS from 'https://esm.sh/@supabase/supabase-js@2';
import { serve, normalizePhoneNumber } from "../index.ts"; // Import serve and normalizePhoneNumber from actual file
import samplePayload from "./sample_cinc_lead.json" assert { type: "json" }; // Import the sample payload

const TEST_SECRET = "testwebhooksecret123";

// Helper to generate HMAC SHA256 signature
async function generateSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Helper to create a mock request
async function createMockRequest(
  payload: any,
  secretOverride?: string,
  method: string = "POST",
  headers?: HeadersInit
): Promise<Request> {
  const body = JSON.stringify(payload);
  const signature = await generateSignature(body, secretOverride || TEST_SECRET);
  const defaultHeaders = {
    "Content-Type": "application/json",
    "x-cinc-signature": signature,
  };
  return new Request("http://localhost/cinc-webhook", {
    method,
    headers: { ...defaultHeaders, ...headers },
    body: body,
  });
}

Deno.test("normalizePhoneNumber function", () => {
  assertEquals(normalizePhoneNumber("(123) 456-7890", "US"), {
    phone_raw: "(123) 456-7890",
    phone_e164: "+11234567890",
  });
  assertEquals(normalizePhoneNumber("123-456-7890", "US"), {
    phone_raw: "123-456-7890",
    phone_e164: "+11234567890",
  });
  assertEquals(normalizePhoneNumber("079 1234 5678", "GB"), {
    phone_raw: "079 1234 5678",
    phone_e164: "+447912345678",
  });
  assertEquals(normalizePhoneNumber("invalid-phone", "US"), {
    phone_raw: "invalid-phone",
    phone_e164: undefined,
  });
  assertEquals(normalizePhoneNumber(null, "US"), {
    phone_raw: undefined,
    phone_e164: undefined,
  });
  assertEquals(normalizePhoneNumber(undefined, "US"), {
    phone_raw: undefined,
    phone_e164: undefined,
  });
});

Deno.test("CINC Webhook - OPTIONS request", async () => {
  const req = new Request("http://localhost/cinc-webhook", { method: "OPTIONS" });
  const res = await serve(req);
  assertEquals(res.status, 200);
  assertEquals(res.headers.get("Access-Control-Allow-Origin"), "*");
});

Deno.test("CINC Webhook - Missing CINC_WEBHOOK_SECRET", async () => {
  const originalEnvGet = Deno.env.get;
  Deno.env.get = (key: string) => (key === 'CINC_WEBHOOK_SECRET' ? undefined : originalEnvGet(key));
  
  const req = await createMockRequest(samplePayload, TEST_SECRET); // Signature is generated with TEST_SECRET
  const res = await serve(req);
  const resBody = await res.json();

  assertEquals(res.status, 500);
  assertEquals(resBody.error, "Webhook secret not configured");

  Deno.env.get = originalEnvGet; // Restore
});

Deno.test("CINC Webhook - Invalid Signature", async () => {
  const originalEnvGet = Deno.env.get;
  Deno.env.get = (key: string) => (key === 'CINC_WEBHOOK_SECRET' ? TEST_SECRET : originalEnvGet(key));

  const req = await createMockRequest(samplePayload, "wrongsecret");
  const res = await serve(req);
  const resBody = await res.json();
  assertEquals(res.status, 401);
  assertEquals(resBody.error, "Invalid signature");
  
  Deno.env.get = originalEnvGet; // Restore
});

Deno.test("CINC Webhook - Missing x-cinc-signature header", async () => {
  const originalEnvGet = Deno.env.get;
  Deno.env.get = (key: string) => (key === 'CINC_WEBHOOK_SECRET' ? TEST_SECRET : originalEnvGet(key));

  const req = new Request("http://localhost/cinc-webhook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(samplePayload),
  });
  const res = await serve(req);
  const resBody = await res.json();
  assertEquals(res.status, 401); // verifySignature returns false, leading to 401
  assertEquals(resBody.error, "Invalid signature");

  Deno.env.get = originalEnvGet; // Restore
});


Deno.test("CINC Webhook - New Lead Event - Successful Processing", async () => {
  const originalEnvGet = Deno.env.get;
  Deno.env.get = (key: string) => {
    if (key === 'SUPABASE_URL') return 'http://supabase.example.com';
    if (key === 'SUPABASE_ANON_KEY') return 'test_anon_key';
    if (key === 'CINC_WEBHOOK_SECRET') return TEST_SECRET;
    return originalEnvGet(key);
  };

  const mockSupabaseReturnData = { id: "mock_lead_id_123", ...samplePayload.data };
  const mockInsert = spy(async () => ({ data: [mockSupabaseReturnData], error: null }));
  const mockUpsert = spy(async () => ({ data: mockSupabaseReturnData, error: null }));
  
  const mockDbOps = {
    from: spy((tableName: string) => {
      console.log(`Mock SDB: from(${tableName}) called`);
      return mockDbOps;
    }),
    insert: mockInsert,
    upsert: mockUpsert,
    select: spy(() => mockDbOps),
    single: spy(async () => ({ data: mockSupabaseReturnData, error: null })),
  };
  const createClientStub = stub(supabaseJS, "createClient", () => mockDbOps as any);

  const req = await createMockRequest(samplePayload);
  const res = await serve(req);
  const resBody = await res.json();

  assertEquals(res.status, 200);
  assertEquals(resBody.message, "Lead processed successfully");
  assertExists(resBody.lead);

  // Verify webhook_events insert
  assertEquals(mockDbOps.from.calls[0].args[0], "webhook_events");
  assertEquals(mockInsert.calls.length, 1);
  assertObjectMatch(mockInsert.calls[0].args[0] as any, {
      provider: 'CINC',
      event_id: samplePayload.event_id,
      payload: samplePayload,
  });

  // Verify leads upsert
  assertEquals(mockDbOps.from.calls[1].args[0], "leads");
  assertEquals(mockUpsert.calls.length, 1);
  const expectedLeadRecord = {
    cinc_lead_id: samplePayload.data.lead_id,
    first_name: samplePayload.data.first_name,
    last_name: samplePayload.data.last_name,
    email: samplePayload.data.email,
    phone_raw: "(555) 987-6543",
    phone_e164: "+15559876543",
    source: samplePayload.data.source_type,
    status: samplePayload.data.pipeline_status.toLowerCase(),
    notes: samplePayload.data.note,
  };
  assertObjectMatch(mockUpsert.calls[0].args[0] as any, expectedLeadRecord);
  assertEquals(mockUpsert.calls[0].args[1], { onConflict: 'cinc_lead_id', ignoreDuplicates: false });

  createClientStub.restore();
  Deno.env.get = originalEnvGet;
});

Deno.test("CINC Webhook - New Lead Event - Missing lead_id in payload data", async () => {
  const originalEnvGet = Deno.env.get;
   Deno.env.get = (key: string) => {
    if (key === 'SUPABASE_URL') return 'http://supabase.example.com';
    if (key === 'SUPABASE_ANON_KEY') return 'test_anon_key';
    if (key === 'CINC_WEBHOOK_SECRET') return TEST_SECRET;
    return originalEnvGet(key);
  };
  const createClientStub = stub(supabaseJS, "createClient", () => ({ /* basic mock */ } as any));


  const payloadWithoutLeadId = JSON.parse(JSON.stringify(samplePayload));
  delete payloadWithoutLeadId.data.lead_id;

  const req = await createMockRequest(payloadWithoutLeadId);
  const res = await serve(req);
  const resBody = await res.json();

  assertEquals(res.status, 400);
  assertEquals(resBody.error, "CINC Lead ID missing");
  
  createClientStub.restore();
  Deno.env.get = originalEnvGet;
});


Deno.test("CINC Webhook - New Lead Event - Supabase upsert error", async () => {
  const originalEnvGet = Deno.env.get;
  Deno.env.get = (key: string) => {
    if (key === 'SUPABASE_URL') return 'http://supabase.example.com';
    if (key === 'SUPABASE_ANON_KEY') return 'test_anon_key';
    if (key === 'CINC_WEBHOOK_SECRET') return TEST_SECRET;
    return originalEnvGet(key);
  };

  const supabaseError = { message: "Supabase upsert failed", details: "Connection error" };
  const mockInsert = spy(async () => ({ data: [{id: "mock_event_id"}], error: null })); // webhook_events insert succeeds
  const mockUpsert = spy(async () => ({ data: null, error: supabaseError })); // leads upsert fails

  const mockDbOps = {
    from: spy(() => mockDbOps),
    insert: mockInsert,
    upsert: mockUpsert,
    select: spy(() => mockDbOps),
    single: spy(async () => ({ data: null, error: supabaseError })),
  };
  const createClientStub = stub(supabaseJS, "createClient", () => mockDbOps as any);

  const req = await createMockRequest(samplePayload);
  const res = await serve(req);
  const resBody = await res.json();
  
  assertEquals(res.status, 500);
  assertEquals(resBody.error, "Failed to process lead data");
  assertEquals(resBody.details, supabaseError.message);

  createClientStub.restore();
  Deno.env.get = originalEnvGet;
});

// TODO: Add tests for NOTE_ADDED_WEBHOOK event type
// TODO: Add tests for LEAD_UPDATE_WEBHOOK event type
// TODO: Add tests for payload.data vs payload.data.buyer variations if structure truly varies

