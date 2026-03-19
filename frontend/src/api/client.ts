import axios from 'axios';
import type {
  AdminDashboard,
  AdminOrder,
  AllocationDetail,
  ApiErrorPayload,
  Charity,
  CharityAllocationSummary,
  CharityOrder,
  CreateDonationAllocationInput,
  CreateCharityOrderInput,
  CreateMockPaymentInput,
  DemoActor,
  DonorAllocation,
  DonorDashboard,
  DonorPayment,
  PartnerProduct,
} from './types';
import { formatApiErrorMessage } from '../utils/format';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  timeout: 10000,
});

let actorIdHeader: number | null = null;

apiClient.interceptors.request.use((config) => {
  if (actorIdHeader) {
    config.headers['X-Actor-Id'] = String(actorIdHeader);
  }

  return config;
});

export class ApiClientError extends Error {
  status: number | null;
  errorCode: string;
  fieldErrors: ApiErrorPayload['fieldErrors'];

  constructor(payload?: Partial<ApiErrorPayload>) {
    super(formatApiErrorMessage(payload?.message ?? 'The request could not be completed.', payload?.errorCode));
    this.name = 'ApiClientError';
    this.status = payload?.status ?? null;
    this.errorCode = payload?.errorCode ?? 'UNKNOWN_ERROR';
    this.fieldErrors = payload?.fieldErrors ?? [];
  }
}

function mapError(error: unknown): never {
  if (axios.isAxiosError<ApiErrorPayload>(error) && error.response?.data) {
    throw new ApiClientError(error.response.data);
  }

  throw new ApiClientError({
    message: 'Unable to reach the backend. Check that the Spring Boot app is running.',
    errorCode: 'NETWORK_ERROR',
  });
}

export function setApiActorId(actorId: number | null) {
  actorIdHeader = actorId;
}

export async function listDemoActors() {
  try {
    const response = await apiClient.get<DemoActor[]>('/api/v1/demo/actors');
    return response.data;
  } catch (error) {
    mapError(error);
  }
}

export async function listCharities() {
  try {
    const response = await apiClient.get<Charity[]>('/api/v1/charities');
    return response.data;
  } catch (error) {
    mapError(error);
  }
}

export async function getDonorDashboard() {
  try {
    const response = await apiClient.get<DonorDashboard>('/api/v1/donor/me/dashboard');
    return response.data;
  } catch (error) {
    mapError(error);
  }
}

export async function listDonorPayments() {
  try {
    const response = await apiClient.get<DonorPayment[]>('/api/v1/donor/me/payments');
    return response.data;
  } catch (error) {
    mapError(error);
  }
}

export async function createMockPayment(input: CreateMockPaymentInput) {
  try {
    const response = await apiClient.post<DonorPayment>('/api/v1/donor/payments', input);
    return response.data;
  } catch (error) {
    mapError(error);
  }
}

export async function convertDonorPayment(paymentId: number) {
  try {
    const response = await apiClient.post<DonorPayment>(`/api/v1/donor/payments/${paymentId}/convert`);
    return response.data;
  } catch (error) {
    mapError(error);
  }
}

export async function listDonorAllocations() {
  try {
    const response = await apiClient.get<DonorAllocation[]>('/api/v1/donor/me/allocations');
    return response.data;
  } catch (error) {
    mapError(error);
  }
}

export async function createDonationAllocation(input: CreateDonationAllocationInput) {
  try {
    const response = await apiClient.post<DonorAllocation>('/api/v1/donor/allocations', input);
    return response.data;
  } catch (error) {
    mapError(error);
  }
}

export async function listPartnerProducts() {
  try {
    const response = await apiClient.get<PartnerProduct[]>('/api/v1/partner-products');
    return response.data;
  } catch (error) {
    mapError(error);
  }
}

export async function listMyAllocations() {
  try {
    const response = await apiClient.get<CharityAllocationSummary[]>('/api/v1/charity/me/allocations');
    return response.data;
  } catch (error) {
    mapError(error);
  }
}

export async function listMyOrders() {
  try {
    const response = await apiClient.get<CharityOrder[]>('/api/v1/charity/me/orders');
    return response.data;
  } catch (error) {
    mapError(error);
  }
}

export async function createCharityOrder(input: CreateCharityOrderInput) {
  try {
    const response = await apiClient.post<CharityOrder>('/api/v1/charity/orders', input);
    return response.data;
  } catch (error) {
    mapError(error);
  }
}

export async function getAllocationDetail(allocationId: number) {
  try {
    const response = await apiClient.get<AllocationDetail>(`/api/v1/allocations/${allocationId}/detail`);
    return response.data;
  } catch (error) {
    mapError(error);
  }
}

export async function getAdminDashboard() {
  try {
    const response = await apiClient.get<AdminDashboard>('/api/v1/admin/dashboard');
    return response.data;
  } catch (error) {
    mapError(error);
  }
}

export async function getAdminOrders() {
  try {
    const response = await apiClient.get<AdminOrder[]>('/api/v1/admin/orders');
    return response.data;
  } catch (error) {
    mapError(error);
  }
}

export async function completeAdminOrder(orderId: number) {
  try {
    const response = await apiClient.patch<AdminOrder>(`/api/v1/admin/orders/${orderId}/complete`);
    return response.data;
  } catch (error) {
    mapError(error);
  }
}
