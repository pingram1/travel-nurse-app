import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, View } from 'react-native';

import { Badge, Button, Card, HeroBanner, Input, SectionHeader } from '@/components/ui';
import { useBoardingPass } from '@/hooks/useBoardingPass';
import { useTrip } from '@/hooks/useTrip';
import { BOOKING_HREF } from '@/utils/booking';

export default function BoardingPassScreen() {
  const router = useRouter();
  const trip = useTrip();
  const boarding = useBoardingPass();
  const [pasteText, setPasteText] = useState('');

  const extract = boarding.extract;

  return (
    <ScrollView className="flex-1 bg-surface-canvas" contentContainerClassName="gap-5 p-4 pb-10">
      <HeroBanner
        eyebrow="Boarding pass OCR"
        title="Import your flight"
        subtitle="Upload a photo or screenshot. We extract airline, flight number, and seat into your itinerary."
      />

      {!trip.destination ? (
        <Card variant="soft">
          <Text className="text-sm text-slate-600">
            Choose a facility or destination city on the Trip Hub first so the scanned flight
            attaches to your trip.
          </Text>
          <View className="mt-3">
            <Button label="Back to Trip Hub" variant="soft" onPress={() => router.back()} />
          </View>
        </Card>
      ) : (
        <>
          <SectionHeader
            title="Capture"
            subtitle={`Trip: ${trip.destination.label} · ${trip.destination.airportCode}`}
          />
          <Card>
            <View className="gap-3">
              <Button
                label={boarding.isScanning ? 'Scanning…' : 'Upload from photo library'}
                onPress={() => void boarding.pickFromLibrary()}
                disabled={boarding.isScanning}
              />
              <Button
                label="Take photo"
                variant="soft"
                onPress={() => void boarding.capturePhoto()}
                disabled={boarding.isScanning}
              />
              {boarding.isScanning ? (
                <View className="flex-row items-center gap-3">
                  <ActivityIndicator color="#0f766e" />
                  <Text className="text-sm text-slate-600">Running OCR on boarding pass…</Text>
                </View>
              ) : null}
              {boarding.error ? (
                <Text className="text-sm font-medium text-danger-600">{boarding.error}</Text>
              ) : null}
            </View>
          </Card>

          <SectionHeader
            title="Or paste pass text"
            subtitle="Fallback when the photo is blurry — paste airline / flight / seat lines"
          />
          <Card>
            <View className="gap-3">
              <Input
                label="Boarding pass text"
                value={pasteText}
                onChangeText={setPasteText}
                multiline
                numberOfLines={4}
                placeholder="e.g. United UA 619  AUS → ORD  Seat 12C  2026-08-01"
                hint="Include airline, flight number, airports, seat, and date if available"
              />
              <Button
                label="Parse text"
                variant="soft"
                onPress={() => boarding.parseText(pasteText)}
                disabled={pasteText.trim().length < 6}
              />
            </View>
          </Card>

          {extract ? (
            <>
              <SectionHeader
                title="Extracted fields"
                subtitle="Mapped into your travel itinerary"
              />
              <Card>
                <View className="gap-2">
                  <Field label="Airline" value={extract.airline} />
                  <Field label="Flight" value={extract.flightNumber} />
                  <Field label="Seat" value={extract.seatNumber} />
                  <Field
                    label="Route"
                    value={
                      extract.departureAirport && extract.arrivalAirport
                        ? `${extract.departureAirport} → ${extract.arrivalAirport}`
                        : null
                    }
                  />
                  <Field label="Date" value={extract.departureDate} />
                  <Field label="Passenger" value={extract.passengerName} />
                  <View className="mt-1 flex-row flex-wrap gap-2">
                    <Badge
                      label={`Confidence ${Math.round(extract.confidence * 100)}%`}
                      tone={extract.confidence >= 0.6 ? 'success' : 'warning'}
                    />
                  </View>
                </View>
              </Card>

              {extract.sourceImageUri ? (
                <Card>
                  <Text className="mb-2 text-sm font-semibold text-slate-700">Source image</Text>
                  <Image
                    source={{ uri: extract.sourceImageUri }}
                    className="h-48 w-full rounded-2xl"
                    resizeMode="contain"
                  />
                </Card>
              ) : null}

              <Button
                label="Add to itinerary"
                onPress={() => {
                  const ok = boarding.applyToItinerary();
                  if (!ok) return;
                  if (boarding.extract?.seatNumber) {
                    router.push(BOOKING_HREF.seats);
                    return;
                  }
                  router.push(BOOKING_HREF.hub);
                }}
              />
              <Button label="Clear scan" variant="ghost" onPress={boarding.clear} />
            </>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <Text className="text-sm text-slate-500">{label}</Text>
      <Text className="flex-1 text-right text-sm font-semibold text-slate-900">
        {value?.trim() ? value : '—'}
      </Text>
    </View>
  );
}
