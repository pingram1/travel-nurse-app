import type { Hospital } from '@/types';

/** Human-readable campus line used to differentiate identical org names. */
export function formatHospitalCampusLine(hospital: Hospital): string {
  const street =
    hospital.address.street && hospital.address.street !== 'Address TBD'
      ? hospital.address.street
      : null;
  const zip =
    hospital.address.zipCode && hospital.address.zipCode !== '00000'
      ? hospital.address.zipCode
      : null;
  const parts = [street, zip].filter(Boolean);
  if (parts.length > 0) return parts.join(', ');
  const npi = hospital.id.replace(/^npi-/, '');
  return npi ? `NPI ${npi}` : hospital.city;
}

export function formatHospitalOptionTitle(hospital: Hospital): string {
  const campus = formatHospitalCampusLine(hospital);
  // Keep name + campus in the primary line so identical org names are distinguishable.
  if (campus.startsWith('NPI ')) {
    return `${hospital.name} (${campus})`;
  }
  return `${hospital.name} — ${campus}`;
}

export function formatHospitalOptionSubtitle(hospital: Hospital): string {
  const zip =
    hospital.address.zipCode && hospital.address.zipCode !== '00000'
      ? ` ${hospital.address.zipCode}`
      : '';
  return `${hospital.city}, ${hospital.state}${zip} · ${hospital.airportCode} · Grade ${hospital.safety.overallGrade}`;
}
