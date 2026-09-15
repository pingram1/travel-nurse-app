# Travel Nurse App — Executive Playbook

**Product:** Travel Nurse App  
**Developed by:** Start Right Tutoring, LLC  
**Audience:** CEO, potential business partners, and executive stakeholders

---

## Executive Summary

Travel Nurse App is an all-in-one logistics and safety platform for travel nurses and physicians on assignment. It replaces a fragmented stack of airline sites, housing marketplaces, ride apps, spreadsheets, and paper credentials with a single assignment workspace built around 13-week contracts.

Clinicians plan lodging, flights, dining, and ground transportation around a hospital or destination city; see safety intelligence before they book housing; track housing stipend against real nightly rates; and keep licenses in an on-device credential vault. Bookings complete with trusted external partners (airlines, hotels, Airbnb, Uber, Lyft, Turo, Enterprise, Hertz). The app is the control center—not a competing booking engine.

**Value proposition:** Safer assignments, faster trip setup, clearer take-home economics, and credential readiness—packaged for scale with staffing firms, health systems, and travel-logistics partners.

---

## Key Capabilities

### Assignment logistics in one flow

Clinicians search a nationwide hospital directory or skip the facility and plan by city. They enter contract dates, then complete lodging, flights, City Finder, and ground transportation in a guided workflow. A **Housing-First** mode (on by default) locks housing before flights so the housing stipend is used first. An itinerary dashboard consolidates every selection, estimated trip cost, and completion status. Confirming the itinerary switches the product into **Travel mode** for the weeks on assignment.

### Safety-first housing and facility intelligence

Facility grades combine BLS OSHA workplace compliance, FBI NIBRS residential crime data, and nurse-verified reviews into an overall A–F grade. Lodging within 25 miles is ranked **Preferred**, **Standard**, or **Review area**—safest options first—and filtered against the clinician’s daily housing stipend. Basic access includes the overall grade and lodging labels. **Pro** unlocks OSHA scores, crime-index detail, nurse-verified ratings, and the reasoning behind each lodging safety label.

### External booking, captured back into the itinerary

Flights search major carriers (American, United, Delta, Southwest, Alaska, JetBlue, plus Spirit and Frontier on import) for the contract window. Seat purchase and ticket issuance happen on the airline. The clinician imports a boarding pass (photo, camera, or pasted text); the app extracts airline, flight, seat, and route and places the seat on an aircraft locator. Lodging books on the hotel site or Airbnb. Ground transport is either ride-share (Uber/Lyft, timed to arrival) or a weekly rental (Turo, Enterprise, Hertz)—one primary mode per trip.

### Life on assignment

**City Finder** maps dining, groceries, gyms, and entertainment within 50 miles of the facility or selected lodging. Saved dining (and optional entertainment) rolls into the itinerary. In Travel mode, clinicians keep a **rental log** (mileage, insurance photo, before/after/fuel photos) or a **ride-share log** (receipt screenshots) so assignment expenses stay documented.

### Stipend and take-home visibility

The Stipend Tracker captures gross weekly pay, daily housing stipend, and tax home. Tax home autofills the departure airport on the Trip Hub. Lodging over the daily stipend is filtered out; remaining options show variance (at stipend or under). Estimated take-home is shown alongside an optional note that the subscription may qualify as a professional expense (with a tax-advisor disclaimer).

### Credential vault and role-based access

Licenses and certifications—state RN/license, BLS, ACLS, and TB/IGRA—live in hardware-backed secure storage with status (valid, expiring within 30 days, expired). Access is role-based:

| Role | Vault access |
|---|---|
| Nurse / Physician | Read and write credentials |
| HR | Read and export |
| Administrator | Read, write, delete, and export |

Authorized HR and administrators can export credential records for compliance files without exposing session tokens or full payment data.

### Subscription

Three Pro plans: **Monthly $12.99**, **Semi-annual $78.99**, **Annual $156.99**. Pro is the commercial unlock for detailed safety intelligence. Payment methods store brand, last four digits, and expiry only—never a full card number.

---

## Partnership & Expansion Potential

The product is designed as a **orchestration layer**. Booking, maps, and public safety data already sit with established providers, which makes white-label and channel partnerships straightforward.

**Current partner surface**

| Domain | Partners / sources | Partner value |
|---|---|---|
| Facilities | CMS NPPES hospital registry | Nationwide acute-care coverage without a private facility database |
| Maps & places | Google Places; OpenStreetMap fallback | Live lodging and City Finder at assignment locations |
| Air | Airline apps and sites (AA, UA, DL, WN, AS, B6, NK, F9) | Traffic to airline booking; itinerary returns via boarding-pass import |
| Housing | Hotels and Airbnb | Deep links; stipend- and safety-filtered demand |
| Ground | Uber, Lyft, Turo, Enterprise, Hertz | Airport pickup and weekly commute products |
| Safety data | BLS OSHA, FBI NIBRS, clinician reviews | Differentiated, defensible housing recommendations |

**Scale and white-label**

- **Staffing agencies and MSPs** can position the app as the clinician-facing logistics companion to a contract, with Housing-First and stipend filters aligned to agency housing policy.
- **Health systems** can use facility safety grades and credential vault export as an onboarding and compliance adjunct for traveling clinicians.
- **Travel and lodging partners** can receive qualified, date-bounded demand (contract start/end, tax-home origin, destination airport) rather than generic consumer search.
- **API-first architecture** (`api.travelnurse.dev`) already envelopes hospitals, lodging, flights, city places, safety ratings, and boarding-pass OCR—suitable for a partner-branded client or an embedded module.

**Planned: work-order initiation**

Automated trip planning from a staffing **work order** (PDF or email)—facility name, address, and contract dates parsed and matched to a hospital—is on the product roadmap. When released, agencies will be able to drop a contract into the app and open a pre-filled Trip Hub instead of asking clinicians to re-key assignment details.

---

## Security & Architecture (High-Level)

**Data protection**

- Access tokens, refresh tokens, and credential payloads are stored in the device keychain/keystore—not in ordinary app storage.
- The vault uses role-based permissions; clinicians cannot delete or export records unless their role allows it. HR export and admin delete are first-class operations.
- Payment data is limited to brand, last four, and expiry. Full card numbers never enter the client.
- Safety UI for Basic users shows labels only; raw crime-index reasoning is reserved for Pro so sensitive area scoring is not broadly exposed.

**Compliance posture**

- Credential types map to typical travel-clinician onboarding (license, BLS, ACLS, TB).
- Expiry windows (valid / expiring / expired) support agency and facility file audits.
- Stipend and tax-home tools are decision support, not tax advice; deductibility copy directs users to a tax advisor.
- Facility safety draws on public BLS OSHA and FBI NIBRS sources plus verified clinician reviews.

**Infrastructure reliability**

- Mobile client: Expo / React Native, with a single HTTP client, typed success/error envelopes, and a request ID on every call.
- Backend-first search for hospitals, lodging, flights, places, safety, and boarding-pass OCR, with public-data fallbacks (NPPES, Google Places, OpenStreetMap) so assignment planning continues if a partner endpoint is slow.
- Session restore on launch; sign-out clears secure credentials.
- Roles (`nurse`, `physician`, `hr`, `admin`) are modeled in the product so enterprise customers can map the app to existing workforce directories.

---

*Confidential — for executive and partner review. Developed by Start Right Tutoring, LLC.*
