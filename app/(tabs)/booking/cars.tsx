import { Redirect } from 'expo-router';

import { BOOKING_HREF } from '@/utils/booking';

/** @deprecated Use `ground` — kept so existing links don't unmatched-route. */
export default function CarsRedirect() {
  return <Redirect href={BOOKING_HREF.ground} />;
}
