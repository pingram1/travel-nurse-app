import * as ImagePicker from 'expo-image-picker';

import { apiPost } from '@/services/api/client';
import type { BoardingPassExtract, SeatClass, SeatSelection } from '@/types';

const AIRLINE_ALIASES: Array<{ match: RegExp; name: string; code: string }> = [
  { match: /\bamerican(\s+airlines?)?\b|\bAA\b/i, name: 'American', code: 'AA' },
  { match: /\bunited(\s+airlines?)?\b|\bUA\b/i, name: 'United', code: 'UA' },
  { match: /\bdelta(\s+air\s*lines?)?\b|\bDL\b/i, name: 'Delta', code: 'DL' },
  { match: /\bsouthwest(\s+airlines?)?\b|\bWN\b/i, name: 'Southwest', code: 'WN' },
  { match: /\balaska(\s+airlines?)?\b|\bAS\b/i, name: 'Alaska', code: 'AS' },
  { match: /\bjetblue\b|\bB6\b/i, name: 'JetBlue', code: 'B6' },
  { match: /\bspirit\b|\bNK\b/i, name: 'Spirit', code: 'NK' },
  { match: /\bfrontier\b|\bF9\b/i, name: 'Frontier', code: 'F9' },
];

const FLIGHT_NUMBER_RE = /\b(?:flight\s*(?:no\.?|number|#)?\s*)?([A-Z]{2})\s*[-\s]?(\d{1,4})\b/i;
const SEAT_RE = /\b(?:seat|row)\s*[:#-]?\s*(\d{1,2})\s*([A-F])\b/i;
const SEAT_COMPACT_RE = /\b(\d{1,2})([A-F])\b/;
const AIRPORT_PAIR_RE = /\b([A-Z]{3})\s*(?:→|->|to|–|-)\s*([A-Z]{3})\b/i;
const DATE_RE = /\b(20\d{2}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]20\d{2})\b/;
const PASSENGER_RE = /(?:passenger|name)\s*[:#-]?\s*([A-Z][A-Z\s,'.-]{2,40})/i;

export function parseBoardingPassText(rawText: string): BoardingPassExtract {
  const text = rawText.replace(/\s+/g, ' ').trim();
  let airline: string | null = null;
  let airlineCode: string | null = null;

  for (const alias of AIRLINE_ALIASES) {
    if (alias.match.test(text)) {
      airline = alias.name;
      airlineCode = alias.code;
      break;
    }
  }

  const flightMatch = text.match(FLIGHT_NUMBER_RE);
  let flightNumber: string | null = null;
  if (flightMatch) {
    const code = flightMatch[1]!.toUpperCase();
    const num = flightMatch[2]!;
    flightNumber = `${code} ${num}`;
    if (!airline) {
      const known = AIRLINE_ALIASES.find((a) => a.code === code);
      airline = known?.name ?? code;
      airlineCode = code;
    }
  } else if (airlineCode) {
    const loose = text.match(new RegExp(`\\b${airlineCode}\\s*(\\d{1,4})\\b`, 'i'));
    if (loose) flightNumber = `${airlineCode} ${loose[1]}`;
  }

  const seatMatch = text.match(SEAT_RE) ?? text.match(SEAT_COMPACT_RE);
  const seatNumber = seatMatch ? `${seatMatch[1]}${seatMatch[2]!.toUpperCase()}` : null;

  const airportMatch = text.match(AIRPORT_PAIR_RE);
  const departureAirport = airportMatch?.[1]?.toUpperCase() ?? null;
  const arrivalAirport = airportMatch?.[2]?.toUpperCase() ?? null;

  const dateMatch = text.match(DATE_RE);
  let departureDate: string | null = null;
  if (dateMatch) {
    const raw = dateMatch[1]!.replace(/\//g, '-');
    if (/^\d{1,2}-\d{1,2}-20\d{2}$/.test(raw)) {
      const [m, d, y] = raw.split('-');
      departureDate = `${y}-${m!.padStart(2, '0')}-${d!.padStart(2, '0')}`;
    } else {
      departureDate = raw;
    }
  }

  const passengerMatch = text.match(PASSENGER_RE);
  const passengerName = passengerMatch?.[1]?.trim() ?? null;

  const fields = [airline, flightNumber, seatNumber, departureAirport, arrivalAirport];
  const filled = fields.filter(Boolean).length;
  const confidence = Math.round((filled / fields.length) * 100) / 100;

  return {
    airline,
    flightNumber,
    seatNumber,
    departureAirport,
    arrivalAirport,
    departureDate,
    passengerName,
    rawText: text,
    confidence,
  };
}

export async function pickBoardingPassImage(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.85,
    base64: false,
    allowsEditing: true,
  });

  if (result.canceled || !result.assets[0]?.uri) {
    return null;
  }

  return result.assets[0].uri;
}

export async function takeBoardingPassPhoto(): Promise<string | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    quality: 0.85,
    allowsEditing: true,
  });

  if (result.canceled || !result.assets[0]?.uri) {
    return null;
  }

  return result.assets[0].uri;
}

/**
 * OCR a boarding-pass image via the backend Vision endpoint, then map fields.
 * When the API is unavailable, returns a low-confidence empty extract so the
 * caller can fall back to paste-to-parse.
 */
export async function scanBoardingPassImage(imageUri: string): Promise<BoardingPassExtract> {
  try {
    const envelope = await Promise.race([
      apiPost<BoardingPassExtract, { imageUri: string }>(
        '/boarding-pass/ocr',
        { imageUri },
        { timeout: 8_000 },
      ),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('ocr timeout')), 8_500);
      }),
    ]);
    const data = envelope.data;
    if (data.rawText && (!data.flightNumber || !data.airline)) {
      const parsed = parseBoardingPassText(data.rawText);
      return {
        ...parsed,
        ...data,
        sourceImageUri: imageUri,
        rawText: data.rawText || parsed.rawText,
      };
    }
    return { ...data, sourceImageUri: imageUri };
  } catch {
    return {
      airline: null,
      flightNumber: null,
      seatNumber: null,
      departureAirport: null,
      arrivalAirport: null,
      departureDate: null,
      passengerName: null,
      rawText: '',
      confidence: 0,
      sourceImageUri: imageUri,
    };
  }
}

export function seatSelectionFromBoardingPass(
  flightId: string,
  seatNumber: string,
): SeatSelection | null {
  const match = seatNumber
    .trim()
    .toUpperCase()
    .match(/^(\d{1,2})([A-F])$/);
  if (!match) return null;

  const row = Number(match[1]);
  const column = match[2]!;
  const seatClass: SeatClass = row <= 4 ? 'first' : row <= 8 ? 'premium' : 'economy';

  return {
    flightId,
    seatId: `${row}${column}`,
    row,
    column,
    seatClass,
    price: 0,
    label: `${row}${column}`,
  };
}
