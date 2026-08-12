import api from "../lib/axios";

export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

export interface Voucher {
  id: string;
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: string; // Decimal dari backend (string)
  minPurchaseAmount: string;
  maxDiscountAmount: string;
  quota: number;
  expiresAt: string;
  createdAt: string;
}

export interface ValidateVoucherResponse {
  voucher: Voucher;
  discount: number; // Nominal potongan dalam Rupiah, sudah dihitung backend
}

export interface CreateVoucherPayload {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minPurchaseAmount: number;
  maxDiscountAmount: number;
  quota: number;
  expiresAt: string; // ISO date string
}

export type UpdateVoucherPayload = Partial<CreateVoucherPayload>;

export const voucherService = {
  async getAll(): Promise<Voucher[]> {
    const response = await api.get<Voucher[]>("/vouchers");
    return response.data;
  },

  async getById(id: string): Promise<Voucher> {
    const response = await api.get<Voucher>(`/vouchers/${id}`);
    return response.data;
  },

  async create(payload: CreateVoucherPayload): Promise<Voucher> {
    const response = await api.post<Voucher>("/vouchers", payload);
    return response.data;
  },

  async update(
    id: string,
    payload: UpdateVoucherPayload
  ): Promise<Voucher> {
    const response = await api.patch<Voucher>(`/vouchers/${id}`, payload);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/vouchers/${id}`);
  },

  async validateVoucher(
    code: string,
    purchaseAmount: number
  ): Promise<ValidateVoucherResponse> {
    const response = await api.post<ValidateVoucherResponse>(
      "/vouchers/validate",
      { code, purchaseAmount }
    );
    return response.data;
  },
};