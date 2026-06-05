import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Card } from '@/components/ui';
import { useBooking } from '@/hooks/useBooking';
import { extractWorkOrderFields } from '@/services/api/parserService';
import type { WorkOrder } from '@/types';
import { generateRequestId } from '@/utils/uuid';

const SAMPLE_WORK_ORDER = `Facility Name: Mercy General Hospital
Address: 1200 Oak Street, Portland, OR 97201
Start Date: 2026-08-01
End Date: 2026-11-01`;

const STEP_LABELS = {
  housing: 'Housing',
  flights: 'Flights',
  transit: 'Transit',
  review: 'Review',
} as const;

export default function BookingScreen() {
  const {
    housingFirstEnabled,
    workflowSteps,
    activeStep,
    workOrder,
    toggleHousingFirst,
    applyWorkOrder,
    goToStep,
  } = useBooking();

  useEffect(() => {
    const fields = extractWorkOrderFields(SAMPLE_WORK_ORDER);
    if (!fields || workOrder) return;

    const order: WorkOrder = {
      id: generateRequestId(),
      source: 'email',
      facilityName: fields.facilityName,
      facilityAddress: fields.facilityAddress,
      contractStartDate: fields.contractStartDate,
      contractEndDate: fields.contractEndDate,
      parsedAt: new Date().toISOString(),
      status: 'parsed',
    };
    applyWorkOrder(order);
  }, [applyWorkOrder, workOrder]);

  return (
    <View className="flex-1 bg-slate-50 p-4">
      <Text className="mb-4 text-2xl font-bold text-slate-900">Safety First Booking</Text>

      <Card className="mb-4 gap-3">
        <Text className="text-base font-semibold text-slate-900">Housing-First Toggle</Text>
        <Text className="text-sm text-slate-600">
          Lock in Hotels/AirBnB before flight allocations to maximize your housing stipend.
        </Text>
        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: housingFirstEnabled }}
          onPress={() => toggleHousingFirst(!housingFirstEnabled)}
          className={`rounded-lg px-4 py-3 ${housingFirstEnabled ? 'bg-brand-600' : 'bg-slate-200'}`}
        >
          <Text
            className={`font-semibold ${housingFirstEnabled ? 'text-white' : 'text-slate-800'}`}
          >
            {housingFirstEnabled ? 'Housing-First: ON' : 'Housing-First: OFF'}
          </Text>
        </Pressable>
      </Card>

      <Card className="mb-4 gap-2">
        <Text className="text-sm font-medium text-slate-500">Workflow order</Text>
        <Text className="text-base text-slate-800">
          {workflowSteps.map((s) => STEP_LABELS[s]).join(' → ')}
        </Text>
        <Text className="text-sm text-brand-600">Active step: {STEP_LABELS[activeStep]}</Text>
      </Card>

      {workOrder ? (
        <Card className="gap-2">
          <Text className="text-base font-semibold text-slate-900">{workOrder.facilityName}</Text>
          <Text className="text-sm text-slate-600">
            {workOrder.facilityAddress.street}, {workOrder.facilityAddress.city},{' '}
            {workOrder.facilityAddress.state}
          </Text>
          <Text className="text-sm text-slate-600">
            Contract: {workOrder.contractStartDate.slice(0, 10)} —{' '}
            {workOrder.contractEndDate.slice(0, 10)}
          </Text>
        </Card>
      ) : null}

      <View className="mt-4 flex-row flex-wrap gap-2">
        {workflowSteps.map((step) => (
          <Pressable
            key={step}
            onPress={() => goToStep(step)}
            className={`rounded-full px-3 py-2 ${activeStep === step ? 'bg-brand-600' : 'bg-slate-200'}`}
          >
            <Text className={activeStep === step ? 'text-white' : 'text-slate-700'}>
              {STEP_LABELS[step]}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
