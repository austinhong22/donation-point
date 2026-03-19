export function formatPoints(value: number) {
  return `${value.toLocaleString()}포인트`;
}

export function formatKrw(value: number) {
  return `${value.toLocaleString()}원`;
}

export function formatDateTime(value: string | null) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('ko-KR', {
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

export function formatStatusLabel(status: string) {
  const labels: Record<string, string> = {
    DONOR: '후원자',
    CHARITY_MANAGER: '기부처 담당자',
    ADMIN: '운영자',
    RECEIVED: '접수됨',
    CONVERTED: '전환 완료',
    ACTIVE: '진행 중',
    FULLY_SPENT: '전액 사용',
    REQUESTED: '요청됨',
    FULFILLED: '완료됨',
    PAYMENT: '결제',
    POINT_CONVERSION: '포인트 전환',
    DONATION_ALLOCATION: '포인트 지정',
    PARTNER_ORDER: '제휴 주문',
  };

  return labels[status] ?? status.split('_').join(' ');
}

export function formatActorDisplayName(name: string) {
  const labels: Record<string, string> = {
    'Demo Donor': '데모 후원자',
    'Demo Charity Manager': '데모 기부처 담당자',
    'Demo Admin': '데모 운영자',
  };

  return labels[name] ?? name;
}

export function formatCharityName(name: string) {
  const labels: Record<string, string> = {
    'Green Shelter': '에이 기부처 그린 쉘터',
    'Bright Meal': '비 기부처 브라이트 밀',
  };

  return labels[name] ?? name;
}

export function formatCharityDescription(description: string) {
  const labels: Record<string, string> = {
    'Provides emergency shelter and daily essentials.': '긴급 주거 지원과 생필품을 제공합니다.',
    'Supports meal kits and pantry assistance for families.': '가정을 위한 식료품 키트와 식생활 지원을 제공합니다.',
  };

  return labels[description] ?? description;
}

export function formatProductName(name: string) {
  const labels: Record<string, string> = {
    'Hygiene Kit': '생필품 키트',
    'Meal Box': '식료품 박스',
    'Blanket Set': '담요 세트',
  };

  return labels[name] ?? name;
}

export function formatProductDescription(description: string) {
  const labels: Record<string, string> = {
    'Soap, toothbrush, toothpaste, and sanitary care items.': '비누, 칫솔, 치약, 위생용품으로 구성된 키트입니다.',
    'Ready-to-deliver food box for a household.': '가정에 바로 전달할 수 있는 식료품 박스입니다.',
    'Blanket and thermal support set for emergency use.': '긴급 상황용 담요와 보온 지원 세트입니다.',
  };

  return labels[description] ?? description;
}

export function formatAuditAction(action: string) {
  const labels: Record<string, string> = {
    PAYMENT_RECEIVED: '모의 결제 생성',
    POINTS_CONVERTED: '포인트 전환 완료',
    ALLOCATION_CREATED: '기부처 포인트 지정',
    PARTNER_ORDER_REQUESTED: '제휴 상품 주문 생성',
    PARTNER_ORDER_FULFILLED: '주문 완료 처리',
  };

  return labels[action] ?? startCase(action);
}

export function formatAuditTargetType(targetType: string) {
  const labels: Record<string, string> = {
    PAYMENT: '결제',
    POINT_CONVERSION: '포인트 전환',
    DONATION_ALLOCATION: '포인트 지정',
    PARTNER_ORDER: '제휴 주문',
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
      fragments.push(`금액 ${formatKrw(parsed.amountKrw)}`);
    }
    if (typeof parsed.convertedPoints === 'number') {
      fragments.push(`전환 ${formatPoints(parsed.convertedPoints)}`);
    }
    if (typeof parsed.allocatedPoints === 'number') {
      fragments.push(`지정 ${formatPoints(parsed.allocatedPoints)}`);
    }
    if (typeof parsed.totalPoints === 'number') {
      fragments.push(`주문 합계 ${formatPoints(parsed.totalPoints)}`);
    }
    if (typeof parsed.quantity === 'number') {
      fragments.push(`수량 ${parsed.quantity}`);
    }
    if (typeof parsed.charityId === 'number') {
      fragments.push(`기부처 #${parsed.charityId}`);
    }
    if (typeof parsed.partnerProductId === 'number') {
      fragments.push(`제휴 상품 #${parsed.partnerProductId}`);
    }
    if (typeof parsed.paymentId === 'number') {
      fragments.push(`결제 #${parsed.paymentId}`);
    }
    if (typeof parsed.allocationId === 'number') {
      fragments.push(`지정 건 #${parsed.allocationId}`);
    }
    if (typeof parsed.fulfilledByAdminId === 'number') {
      fragments.push(`운영자 #${parsed.fulfilledByAdminId}가 완료 처리`);
    }

    return fragments.length > 0 ? fragments.join(' • ') : eventData;
  } catch {
    return eventData;
  }
}

export function formatApiErrorMessage(message: string, errorCode?: string) {
  const codeLabels: Record<string, string> = {
    NETWORK_ERROR: '백엔드에 연결할 수 없습니다. 서버가 실행 중인지 확인해 주세요.',
    RESOURCE_NOT_FOUND: '요청한 대상을 찾을 수 없습니다.',
    AUTHENTICATION_REQUIRED: '사용할 역할을 먼저 선택해 주세요.',
    ACCESS_DENIED: '이 작업을 수행할 권한이 없습니다.',
    INVALID_REQUEST: '요청 값이 올바르지 않습니다.',
    VALIDATION_FAILED: '입력값을 다시 확인해 주세요.',
  };

  const messageLabels: Record<string, string> = {
    'The request could not be completed.': '요청을 처리하지 못했습니다.',
    'Unable to reach the backend. Check that the Spring Boot app is running.': '백엔드에 연결할 수 없습니다. 서버가 실행 중인지 확인해 주세요.',
    'Actor not found for X-Actor-Id header.': '선택한 역할 정보를 찾을 수 없습니다.',
    'X-Actor-Id header is required.': '역할을 먼저 선택해 주세요.',
    'X-Actor-Id header must be a numeric id.': '역할 식별자는 숫자여야 합니다.',
    'Allocation points exceed donor balance.': '지정하려는 포인트가 현재 보유 포인트를 초과합니다.',
    'Payment is already converted.': '이미 포인트로 전환된 결제입니다.',
    'Donor can only convert their own payments.': '후원자는 자신의 결제만 전환할 수 있습니다.',
    'Order total points exceed allocation remaining points.': '주문 포인트가 지정 건의 잔여 포인트를 초과합니다.',
    'Charity manager can only order against allocations of their own charity.': '기부처 담당자는 자신의 기부처 지정 건으로만 주문할 수 있습니다.',
    'Actor does not have permission to view this allocation detail.': '이 지정 상세를 볼 권한이 없습니다.',
    'Partner order is already fulfilled.': '이미 완료 처리된 주문입니다.',
    'Charity not found.': '선택한 기부처를 찾을 수 없습니다.',
    'Payment not found.': '결제 정보를 찾을 수 없습니다.',
    'Allocation not found.': '지정 건 정보를 찾을 수 없습니다.',
    'Partner product not found.': '제휴 상품 정보를 찾을 수 없습니다.',
  };

  return messageLabels[message] ?? (errorCode ? codeLabels[errorCode] ?? message : message);
}
