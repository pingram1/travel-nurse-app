import { Redirect } from 'expo-router';

import { BOOKING_HREF } from '@/utils/booking';

/** @deprecated Use `ground` — kept so existing links don't unmatched-route. */
export default function TransitRedirect() {
  return <Redirect href={BOOKING_HREF.ground} />;
}
