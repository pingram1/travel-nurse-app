import { Ionicons } from '@expo/vector-icons';
import { Linking, Text, View } from 'react-native';

import { Badge, Button, PressableScale } from '@/components/ui';
import { COLORS, SHADOWS } from '@/constants/theme';
import type { LodgingListing } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { classifyLodgingVariance } from '@/utils/stipend';

export interface LodgingCardProps {
  listing: LodgingListing;
  dailyStipendRate: number;
  selected: boolean;
  flagged?: boolean;
  isPro?: boolean;
  onSelect: (lodgingId: string) => void;
  onUnlockPro?: () => void;
}

function safetyBadge(listing: LodgingListing, flagged: boolean) {
  if (flagged || listing.safetyPreference === 'caution') {
    return { label: 'Review area', tone: 'warning' as const };
  }
  if (listing.safetyPreference === 'preferred') {
    return { label: 'Preferred area', tone: 'success' as const };
  }
  return { label: 'Standard area', tone: 'info' as const };
}

async function openExternalBooking(listing: LodgingListing) {
  if (listing.provider === 'airbnb' && listing.bookingAppUrl) {
    try {
      const canOpen = await Linking.canOpenURL(listing.bookingAppUrl);
      if (canOpen) {
        await Linking.openURL(listing.bookingAppUrl);
        return;
      }
    } catch {
      // Fall through to web.
    }
  }
  if (listing.bookingWebUrl) {
    await Linking.openURL(listing.bookingWebUrl);
  }
}

export function LodgingCard({
  listing,
  dailyStipendRate,
  selected,
  flagged = false,
  isPro = false,
  onSelect,
  onUnlockPro,
}: LodgingCardProps) {
  const { variance, varianceAmount } = classifyLodgingVariance(
    listing.nightlyRate,
    dailyStipendRate,
  );
  const varianceLabel =
    variance === 'over'
      ? `${formatCurrency(varianceAmount)} over stipend`
      : variance === 'at'
        ? 'At stipend'
        : `${formatCurrency(Math.abs(varianceAmount))} under stipend`;
  const safety = safetyBadge(listing, flagged);
  const bookLabel = listing.provider === 'airbnb' ? 'Book on Airbnb' : 'Book on hotel site';

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => onSelect(listing.id)}
      className={`rounded-3xl border-2 p-4 ${
        selected
          ? 'border-clinical-600 bg-clinical-50'
          : flagged
            ? 'border-caution-100 bg-white opacity-90'
            : 'border-transparent bg-white'
      }`}
      style={selected ? SHADOWS.card : SHADOWS.soft}
    >
      <View className="flex-row items-start gap-3">
        <View
          className={`mt-0.5 h-12 w-12 items-center justify-center rounded-2xl ${
            selected ? 'bg-clinical-600' : 'bg-medical-100'
          }`}
        >
          <Ionicons
            name={listing.provider === 'hotel' ? 'bed' : 'home'}
            size={22}
            color={selected ? '#ffffff' : COLORS.medical[600]}
          />
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold text-slate-900">{listing.name}</Text>
          <Text className="mt-0.5 text-sm text-slate-500">
            {listing.provider === 'hotel' ? 'Hotel' : 'Airbnb'} · {listing.distanceMiles} mi from
            stay area · ★ {listing.guestRating}
          </Text>
          {listing.vicinity ? (
            <Text className="mt-0.5 text-xs text-slate-400" numberOfLines={2}>
              {listing.vicinity}
            </Text>
          ) : null}
        </View>
        <Text className="text-base font-bold text-medical-700">
          {formatCurrency(listing.nightlyRate)}
          <Text className="text-xs font-medium text-slate-500">/night</Text>
        </Text>
      </View>
      <View className="mt-3 flex-row flex-wrap gap-2">
        <Badge label={varianceLabel} tone={variance === 'over' ? 'danger' : 'success'} />
        <Badge label={safety.label} tone={safety.tone} />
        {selected ? <Badge label="Selected" tone="success" /> : null}
      </View>
      {flagged ? (
        <Text className="mt-2 text-xs font-medium text-caution-800">
          Outside safety preference or stipend thresholds — review before booking.
        </Text>
      ) : null}
      {isPro && listing.safetyContext ? (
        <View className="mt-3 rounded-2xl bg-slate-50 px-3 py-2.5">
          <Text className="text-[11px] font-bold uppercase tracking-[1px] text-slate-400">
            Pro · why this rating
          </Text>
          <Text className="mt-1 text-sm font-semibold text-slate-800">
            Crime index {listing.safetyContext.areaCrimeIndex} / 100 (lower is safer)
          </Text>
          <Text className="mt-1 text-xs leading-5 text-slate-500">
            {listing.safetyContext.summary}
          </Text>
        </View>
      ) : selected && !isPro && onUnlockPro ? (
        <View className="mt-3">
          <Button
            label="See crime-index reasoning — Pro"
            variant="soft"
            size="sm"
            onPress={onUnlockPro}
          />
        </View>
      ) : null}
      {selected ? (
        <View className="mt-3">
          <Button
            label={bookLabel}
            variant="secondary"
            size="sm"
            onPress={() => {
              void openExternalBooking(listing);
            }}
          />
        </View>
      ) : null}
    </PressableScale>
  );
}
