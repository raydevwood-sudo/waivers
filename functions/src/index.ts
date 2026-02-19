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
function toEpochMillis(timestamp: string | number | undefined): number | undefined {
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

export const submitWaiverSecure = onRequest(async (req, res) => {
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

	try {
		const appCheckToken = req.header("X-Firebase-AppCheck");
		if (!appCheckToken) {
			res.status(401).json({error: "Missing App Check token"});
			return;
		}

		await admin.appCheck().verifyToken(appCheckToken);

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
		const {
			passengerTimestamp: _passengerTimestamp,
			witnessTimestamp: _witnessTimestamp,
			...formDataWithoutRawTimestamps
		} = formData;

		const waiverData: Record<string, unknown> = {
			...formDataWithoutRawTimestamps,
			passengerTimestamp: admin.firestore.Timestamp.fromMillis(passengerMillis),
			submittedAt: admin.firestore.Timestamp.now(),
		};

		if (witnessMillis !== undefined) {
			waiverData.witnessTimestamp = admin.firestore.Timestamp
				.fromMillis(witnessMillis);
		}

		const bucket = admin.storage().bucket();
		const pdfFilePath = `waivers/pdfs/${docId}.pdf`;
		const pdfBuffer = Buffer.from(pdfBase64, "base64");

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

		await admin.firestore().collection("waivers").doc(docId).set(waiverData);

		res.status(200).json({
			success: true,
			docId,
			pdfFilePath,
			pdfStoragePath: waiverData.pdfStoragePath,
		});
	} catch (error) {
		logger.error("submitWaiverSecure failed", error as Error);
		res.status(500).json({error: "Failed to submit waiver"});
	}
});
