import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

import { Badge, Button, Card, Input, SectionHeader } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import type { SubscriptionPlanId } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { SUBSCRIPTION_PLANS, planById } from '@/utils/subscription';
import { userInitials } from '@/utils/userDisplay';
import { paymentMethodSchema, profileSchema } from '@/utils/validators';

export default function ProfileSettingsScreen() {
  const auth = useAuth();
  const user = auth.user;

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);

  const [brand, setBrand] = useState(user?.paymentMethod?.brand ?? '');
  const [last4, setLast4] = useState(user?.paymentMethod?.last4 ?? '');
  const [expMonth, setExpMonth] = useState(
    user?.paymentMethod ? String(user.paymentMethod.expMonth) : '',
  );
  const [expYear, setExpYear] = useState(
    user?.paymentMethod ? String(user.paymentMethod.expYear) : '',
  );
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSaved, setPaymentSaved] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  if (!user) {
    return (
      <ScrollView className="flex-1 bg-surface-canvas" contentContainerClassName="gap-4 p-4 pb-10">
        <Card>
          <Text className="text-sm text-slate-600">Sign in to manage your profile.</Text>
        </Card>
      </ScrollView>
    );
  }

  const initials = userInitials(user);
  const activePlan = user.subscriptionPlanId ? planById(user.subscriptionPlanId) : undefined;

  const saveProfile = () => {
    setProfileSaved(false);
    const parsed = profileSchema.safeParse({ firstName, lastName, email, phone });
    if (!parsed.success) {
      setProfileError(parsed.error.issues[0]?.message ?? 'Check your profile details.');
      return;
    }
    setProfileError(null);
    auth.updateProfile({
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      phone: parsed.data.phone ?? '',
    });
    setProfileSaved(true);
  };

  const savePayment = () => {
    setPaymentSaved(false);
    const parsed = paymentMethodSchema.safeParse({ brand, last4, expMonth, expYear });
    if (!parsed.success) {
      setPaymentError(parsed.error.issues[0]?.message ?? 'Check your card details.');
      return;
    }
    setPaymentError(null);
    auth.updatePaymentMethod({
      brand: parsed.data.brand,
      last4: parsed.data.last4,
      expMonth: parsed.data.expMonth,
      expYear: parsed.data.expYear,
    });
    setPaymentSaved(true);
  };

  const pickAvatar = async () => {
    setAvatarError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setAvatarError('Photo library permission is required to change your avatar.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (result.canceled || !result.assets[0]) return;
    auth.setAvatarUri(result.assets[0].uri);
  };

  const selectPlan = (planId: SubscriptionPlanId) => {
    if (!user.paymentMethod) {
      setPaymentError('Save a payment method before starting a subscription.');
      return;
    }
    auth.subscribe(planId);
  };

  return (
    <ScrollView className="flex-1 bg-surface-canvas" contentContainerClassName="gap-4 p-4 pb-10">
      <View className="items-center gap-3 pt-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change profile photo"
          onPress={() => void pickAvatar()}
          className="h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-medical-500"
        >
          {user.avatarUri ? (
            <Image source={{ uri: user.avatarUri }} className="h-24 w-24" />
          ) : (
            <Text className="text-2xl font-bold text-white">{initials}</Text>
          )}
        </Pressable>
        <Button label="Change photo" variant="soft" size="sm" onPress={() => void pickAvatar()} />
        {avatarError ? <Text className="text-sm text-danger-600">{avatarError}</Text> : null}
        <Badge
          label={auth.isPro && activePlan ? `Pro · ${activePlan.label}` : 'Basic plan'}
          tone={auth.isPro ? 'success' : 'info'}
        />
      </View>

      <SectionHeader title="Name & contact" subtitle="Shown on Trip Hub after you sign in" />
      <Card>
        <View className="gap-3">
          <Input label="First name" value={firstName} onChangeText={setFirstName} />
          <Input label="Last name" value={lastName} onChangeText={setLastName} />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="Optional"
          />
          {profileError ? (
            <Text className="text-sm font-medium text-danger-600">{profileError}</Text>
          ) : null}
          {profileSaved ? (
            <Text className="text-sm font-medium text-clinical-700">Profile saved.</Text>
          ) : null}
          <Button label="Save profile" onPress={saveProfile} />
        </View>
      </Card>

      <SectionHeader
        title="Payment"
        subtitle="Store brand and last four only — never a full card number"
      />
      <Card>
        <View className="gap-3">
          <Input label="Card brand" value={brand} onChangeText={setBrand} placeholder="Visa" />
          <Input
            label="Last 4 digits"
            value={last4}
            onChangeText={setLast4}
            keyboardType="number-pad"
            maxLength={4}
            placeholder="4242"
          />
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input
                label="Exp. month"
                value={expMonth}
                onChangeText={setExpMonth}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="12"
              />
            </View>
            <View className="flex-1">
              <Input
                label="Exp. year"
                value={expYear}
                onChangeText={setExpYear}
                keyboardType="number-pad"
                maxLength={4}
                placeholder="2028"
              />
            </View>
          </View>
          {paymentError ? (
            <Text className="text-sm font-medium text-danger-600">{paymentError}</Text>
          ) : null}
          {paymentSaved ? (
            <Text className="text-sm font-medium text-clinical-700">Payment method saved.</Text>
          ) : null}
          <Button label="Save payment method" variant="secondary" onPress={savePayment} />
        </View>
      </Card>

      <SectionHeader
        title="Subscription"
        subtitle="Pro unlocks crime-index reasoning behind lodging safety labels"
      />
      <View className="gap-3">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const selected = user.subscriptionPlanId === plan.id && auth.isPro;
          return (
            <Card key={plan.id} elevated={selected}>
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-base font-bold text-slate-900">{plan.label}</Text>
                  <Text className="mt-0.5 text-sm text-slate-500">{plan.cadence}</Text>
                </View>
                <Text className="text-lg font-bold text-medical-700">
                  {formatCurrency(plan.priceCents / 100)}
                </Text>
              </View>
              <View className="mt-3">
                <Button
                  label={selected ? 'Current plan' : `Choose ${plan.label}`}
                  variant={selected ? 'success' : 'soft'}
                  disabled={selected}
                  onPress={() => selectPlan(plan.id)}
                />
              </View>
            </Card>
          );
        })}
      </View>
      {auth.isPro ? (
        <Button label="Cancel Pro subscription" variant="ghost" onPress={auth.cancelSubscription} />
      ) : null}

      <Button
        label="Sign out"
        variant="danger"
        onPress={() => {
          void auth.signOut().then(() => router.replace('/(auth)/login'));
        }}
      />
    </ScrollView>
  );
}
