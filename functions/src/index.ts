import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

setGlobalOptions({maxInstances: 10});

if (!admin.apps.length) {
  admin.initializeApp();
}

type RawFormData = {
  waiverType: "passenger" | "representative";
  firstName: string;
  lastName: string;
  town: string;
  representativeFirstName?: string;
  representativeLastName?: string;
  email: string;
  phone: string;
  informedConsent1: boolean;
  informedConsent2: boolean;
  informedConsent3: boolean;
  informedConsent4: boolean;
  informedConsent5: boolean;
  waiver1: boolean;
  waiver2: boolean;
  waiver3: boolean;
  waiver4: boolean;
  waiver5: boolean;
  mediaRelease: string;
  passengerSignature: string;
  passengerTimestamp: string | number;
  witnessName: string;
  witnessSignature: string;
  witnessTimestamp?: string | number;
};

type SubmitWaiverRequest = {
  docId: string;
  formData: RawFormData;
  pdfBase64: string;
};

/**
 * Normalize epoch values in seconds/milliseconds into milliseconds.
 * @param {number} value Timestamp as seconds or milliseconds
 * @return {number} Timestamp in milliseconds
 */
function normalizeEpochToMillis(value: number): number {
  return value < 100000000000 ? value * 1000 : value;
}

/**
 * Convert timestamp values to epoch milliseconds.
 * @param {(string|number|undefined)} timestamp Timestamp input
 * @return {(number|undefined)} Epoch timestamp in milliseconds
 */
function toEpochMillis(
  timestamp: string | number | undefined
): number | undefined {
  if (timestamp === undefined) {
    return undefined;
  }

  if (typeof timestamp === "string") {
    const parsedNumber = Number(timestamp);
    if (Number.isFinite(parsedNumber)) {
      return normalizeEpochToMillis(parsedNumber);
    }

    const parsedDate = Date.parse(timestamp);
    return Number.isNaN(parsedDate) ? undefined : parsedDate;
  }

  if (!Number.isFinite(timestamp)) {
    return undefined;
  }

  return normalizeEpochToMillis(timestamp);
}

/**
 * Simple in-memory rate limiter.
 * Note: This resets when the function cold-starts
 */
const requestCounts = new Map<string, {count: number; resetTime: number}>();
const RATE_LIMIT = 100; // requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute in milliseconds

/**
 * Check if request is within rate limit
 * @param {string} identifier - IP address or other identifier
 * @return {boolean} True if within limit
 */
function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(identifier);

  if (!record || now > record.resetTime) {
    // New window
    requestCounts.set(identifier, {
      count: 1,
      resetTime: now + RATE_WINDOW,
    });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false; // Rate limit exceeded
  }

  record.count++;
  return true;
}

export const submitWaiverSecure = onRequest(
  {
    memory: "1GiB",
    timeoutSeconds: 60,
  },
  async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set(
      "Access-Control-Allow-Headers",
      "Content-Type, X-Firebase-AppCheck"
    );

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({error: "Method not allowed"});
      return;
    }

    // Rate limiting check
    const clientIp = (req.headers["x-forwarded-for"] as string) ||
                     req.socket.remoteAddress ||
                     "unknown";
    if (!checkRateLimit(clientIp)) {
      logger.warn("Rate limit exceeded", {ip: clientIp});
      res.status(429).json({
        error: "Too many requests. Please try again later.",
        code: "RATE_LIMIT_EXCEEDED",
      });
      return;
    }

    try {
      const appCheckToken = req.header("X-Firebase-AppCheck");

      // Verify App Check token (required for production security)
      // Set REQUIRE_APP_CHECK=false to disable during development/testing
      const requireAppCheck = process.env.REQUIRE_APP_CHECK !== "false";

      if (requireAppCheck) {
        if (!appCheckToken) {
          logger.error("App Check token missing");
          res.status(401).json({
            error: "App Check token required",
            code: "APP_CHECK_REQUIRED",
          });
          return;
        }

        try {
          await admin.appCheck().verifyToken(appCheckToken);
          logger.info("App Check verification successful");
        } catch (appCheckError) {
          logger.error("App Check verification failed", appCheckError);
          res.status(401).json({
            error: "Invalid App Check token",
            code: "APP_CHECK_INVALID",
          });
          return;
        }
      } else {
        // Development mode - log but don't enforce
        if (appCheckToken) {
          try {
            await admin.appCheck().verifyToken(appCheckToken);
            logger.info("App Check successful (dev mode)");
          } catch (appCheckError) {
            logger.warn("App Check failed (dev mode)",
              appCheckError);
          }
        } else {
          logger.warn("No App Check token provided (dev mode)");
        }
      }

      const body = req.body as SubmitWaiverRequest;
      const docId = body?.docId;
      const formData = body?.formData;
      const pdfBase64 = body?.pdfBase64;

      if (!docId || !formData || !pdfBase64) {
        res.status(400).json({error: "Missing required payload fields"});
        return;
      }

      const passengerMillis = toEpochMillis(formData.passengerTimestamp);
      if (passengerMillis === undefined) {
        res.status(400).json({
          error: "Passenger signature timestamp is invalid",
        });
        return;
      }

      const witnessMillis = toEpochMillis(formData.witnessTimestamp);
      const formDataWithoutRawTimestamps: Record<string, unknown> = {
        ...formData,
      };
      delete formDataWithoutRawTimestamps.passengerTimestamp;
      delete formDataWithoutRawTimestamps.witnessTimestamp;

      const submittedTimestamp = admin.firestore.Timestamp.now();
      const submittedDate = submittedTimestamp.toDate();
      const expiryDate = new Date(submittedDate);
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);

      const waiverData: Record<string, unknown> = {
        ...formDataWithoutRawTimestamps,
        waiverId: docId,
        passengerTimestamp: admin.firestore.Timestamp
          .fromMillis(passengerMillis),
        submittedAt: submittedTimestamp,
        expiresAt: admin.firestore.Timestamp.fromDate(expiryDate),
      };

      if (witnessMillis !== undefined) {
        waiverData.witnessTimestamp = admin.firestore.Timestamp
          .fromMillis(witnessMillis);
      }

      const bucket = admin.storage().bucket();
      const pdfFilePath = `waivers/pdfs/${docId}.pdf`;
      const pdfBuffer = Buffer.from(pdfBase64, "base64");

      // Enforce PDF size limit (10MB max)
      const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB
      if (pdfBuffer.length > MAX_PDF_SIZE) {
        logger.error("PDF exceeds size limit", {size: pdfBuffer.length});
        res.status(413).json({
          error: "Generated PDF is too large. Please contact support.",
          code: "PDF_TOO_LARGE",
          maxSize: MAX_PDF_SIZE,
          actualSize: pdfBuffer.length,
        });
        return;
      }

      await bucket.file(pdfFilePath).save(pdfBuffer, {
        contentType: "application/pdf",
        metadata: {
          metadata: {
            waiverId: docId,
            waiverType: String(formData.waiverType),
            passengerName: `${formData.firstName} ${formData.lastName}`,
          },
        },
      });

      waiverData.pdfFilePath = pdfFilePath;
      waiverData.pdfStoragePath = `gs://${bucket.name}/${pdfFilePath}`;
      waiverData.pdfGeneratedAt = admin.firestore.Timestamp.now();

      await admin.firestore()
        .collection("waivers").doc(docId).create(waiverData);

      res.status(200).json({
        success: true,
        docId,
        pdfFilePath,
        pdfStoragePath: waiverData.pdfStoragePath,
      });
    } catch (error) {
      if ((error as { code?: number }).code === 6) {
        res.status(409).json({error: "Waiver ID already exists"});
        return;
      }

      logger.error("submitWaiverSecure failed", error as Error);
      res.status(500).json({error: "Failed to submit waiver"});
    }
  });
