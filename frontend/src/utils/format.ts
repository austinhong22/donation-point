export function formatPoints(value: number) {
  return `${value.toLocaleString()} pts`;
}

export function formatDateTime(value: string | null) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function startCase(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function formatAuditAction(action: string) {
  const labels: Record<string, string> = {
    PAYMENT_RECEIVED: 'Mock payment received',
    POINTS_CONVERTED: 'Points converted',
    ALLOCATION_CREATED: 'Donation allocation created',
    PARTNER_ORDER_REQUESTED: 'Partner order requested',
    PARTNER_ORDER_FULFILLED: 'Partner order fulfilled',
  };

  return labels[action] ?? startCase(action);
}

export function formatAuditTargetType(targetType: string) {
  const labels: Record<string, string> = {
    PAYMENT: 'Payment',
    POINT_CONVERSION: 'Point conversion',
    DONATION_ALLOCATION: 'Donation allocation',
    PARTNER_ORDER: 'Partner order',
  };

  return labels[targetType] ?? startCase(targetType);
}

export function formatAuditEventData(eventData: string | null) {
  if (!eventData) {
    return null;
  }

  try {
    const parsed = JSON.parse(eventData) as Record<string, number | string>;
    const fragments: string[] = [];

    if (typeof parsed.amountKrw === 'number') {
      fragments.push(`Amount ${parsed.amountKrw.toLocaleString()} KRW`);
    }
    if (typeof parsed.convertedPoints === 'number') {
      fragments.push(`Converted ${formatPoints(parsed.convertedPoints)}`);
    }
    if (typeof parsed.allocatedPoints === 'number') {
      fragments.push(`Allocated ${formatPoints(parsed.allocatedPoints)}`);
    }
    if (typeof parsed.totalPoints === 'number') {
      fragments.push(`Order total ${formatPoints(parsed.totalPoints)}`);
    }
    if (typeof parsed.quantity === 'number') {
      fragments.push(`Quantity ${parsed.quantity}`);
    }
    if (typeof parsed.charityId === 'number') {
      fragments.push(`Charity #${parsed.charityId}`);
    }
    if (typeof parsed.partnerProductId === 'number') {
      fragments.push(`Partner product #${parsed.partnerProductId}`);
    }
    if (typeof parsed.paymentId === 'number') {
      fragments.push(`Payment #${parsed.paymentId}`);
    }
    if (typeof parsed.allocationId === 'number') {
      fragments.push(`Allocation #${parsed.allocationId}`);
    }
    if (typeof parsed.fulfilledByAdminId === 'number') {
      fragments.push(`Completed by admin #${parsed.fulfilledByAdminId}`);
    }

    return fragments.length > 0 ? fragments.join(' • ') : eventData;
  } catch {
    return eventData;
  }
}
