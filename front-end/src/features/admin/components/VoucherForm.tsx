"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  voucherService,
  CreateVoucherPayload,
  DiscountType,
} from "@/services/voucher.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/lib/utils";

interface FormErrors {
  code?: string;
  discountType?: string;
  discountValue?: string;
  minPurchaseAmount?: string;
  maxDiscountAmount?: string;
  quota?: string;
  expiresAt?: string;
  general?: string;
}

export function VoucherForm() {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [minPurchaseAmount, setMinPurchaseAmount] = useState("");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState("");
  const [quota, setQuota] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!code.trim()) {
      newErrors.code = "Kode voucher wajib diisi";
    }

    if (!discountType) {
      newErrors.discountType = "Tipe diskon wajib dipilih";
    }

    if (discountValue === "" || Number(discountValue) < 0) {
      newErrors.discountValue =
        "Nilai diskon wajib diisi dan tidak boleh negatif";
    }

    // IMPORTANT: minPurchaseAmount WAJIB diisi (bukan opsional)
    if (minPurchaseAmount === "" || Number(minPurchaseAmount) < 0) {
      newErrors.minPurchaseAmount =
        "Min. pembelian wajib diisi dan tidak boleh negatif";
    }

    // IMPORTANT: maxDiscountAmount WAJIB diisi (bukan opsional)
    if (maxDiscountAmount === "" || Number(maxDiscountAmount) < 0) {
      newErrors.maxDiscountAmount =
        "Maks. diskon wajib diisi dan tidak boleh negatif";
    }

    if (quota === "" || !Number.isInteger(Number(quota)) || Number(quota) < 1) {
      newErrors.quota = "Kuota wajib diisi, berupa bilangan bulat minimal 1";
    }

    if (!expiresAt) {
      newErrors.expiresAt = "Tanggal berakhir wajib diisi";
    }

    // Validasi logis: nilai diskon persentase maksimal 100
    if (
      discountType === "PERCENTAGE" &&
      discountValue !== "" &&
      Number(discountValue) > 100
    ) {
      newErrors.discountValue = "Diskon persentase maksimal 100%";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validate()) return;

    const payload: CreateVoucherPayload = {
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minPurchaseAmount: Number(minPurchaseAmount),
      maxDiscountAmount: Number(maxDiscountAmount),
      quota: Number(quota),
      expiresAt: new Date(expiresAt).toISOString(),
    };

    if (description.trim()) {
      payload.description = description.trim();
    }

    setIsSubmitting(true);
    try {
      await voucherService.create(payload);
      toast.success("Voucher berhasil dibuat");
      router.push("/admin/vouchers");
      router.refresh();
    } catch (err) {
      setErrors({
        general: getErrorMessage(err, "Gagal membuat voucher"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-2xl space-y-6">
      {errors.general && (
        <div
          role="alert"
          className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive"
        >
          {errors.general}
        </div>
      )}

      {/* Kode */}
      <div>
        <Label htmlFor="code">Kode Voucher</Label>
        <Input
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          aria-invalid={!!errors.code}
          placeholder="cth: WMG10"
          className="mt-1.5"
        />
        {errors.code && (
          <p className="mt-1.5 text-sm text-destructive">{errors.code}</p>
        )}
      </div>

      {/* Deskripsi (opsional) */}
      <div>
        <Label htmlFor="description">
          Deskripsi <span className="text-muted-foreground">(opsional)</span>
        </Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="cth: Diskon 10% untuk pembelian pertama"
          className="mt-1.5"
        />
      </div>

      {/* Tipe diskon */}
      <div>
        <Label htmlFor="discountType">Tipe Diskon</Label>
        <select
          id="discountType"
          value={discountType}
          onChange={(e) => setDiscountType(e.target.value as DiscountType)}
          aria-invalid={!!errors.discountType}
          className="mt-1.5 h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
        >
          <option value="PERCENTAGE">Persentase (%)</option>
          <option value="FIXED_AMOUNT">Nominal (Rp)</option>
        </select>
        {errors.discountType && (
          <p className="mt-1.5 text-sm text-destructive">
            {errors.discountType}
          </p>
        )}
      </div>

      {/* Nilai diskon */}
      <div>
        <Label htmlFor="discountValue">
          {discountType === "PERCENTAGE"
            ? "Nilai Diskon (%)"
            : "Nilai Diskon (Rp)"}
        </Label>
        <Input
          id="discountValue"
          type="number"
          min="0"
          value={discountValue}
          onChange={(e) => setDiscountValue(e.target.value)}
          aria-invalid={!!errors.discountValue}
          placeholder={
            discountType === "PERCENTAGE" ? "cth: 10" : "cth: 50000"
          }
          className="mt-1.5"
        />
        {errors.discountValue && (
          <p className="mt-1.5 text-sm text-destructive">
            {errors.discountValue}
          </p>
        )}
      </div>

      {/* Min pembelian & Max diskon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="minPurchaseAmount">Min. Pembelian (Rp)</Label>
          <Input
            id="minPurchaseAmount"
            type="number"
            min="0"
            value={minPurchaseAmount}
            onChange={(e) => setMinPurchaseAmount(e.target.value)}
            aria-invalid={!!errors.minPurchaseAmount}
            placeholder="cth: 200000"
            className="mt-1.5"
          />
          {errors.minPurchaseAmount && (
            <p className="mt-1.5 text-sm text-destructive">
              {errors.minPurchaseAmount}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="maxDiscountAmount">Maks. Diskon (Rp)</Label>
          <Input
            id="maxDiscountAmount"
            type="number"
            min="0"
            value={maxDiscountAmount}
            onChange={(e) => setMaxDiscountAmount(e.target.value)}
            aria-invalid={!!errors.maxDiscountAmount}
            placeholder="cth: 50000"
            className="mt-1.5"
          />
          {errors.maxDiscountAmount && (
            <p className="mt-1.5 text-sm text-destructive">
              {errors.maxDiscountAmount}
            </p>
          )}
        </div>
      </div>

      {/* Kuota & Tanggal berakhir */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="quota">Kuota</Label>
          <Input
            id="quota"
            type="number"
            min="1"
            step="1"
            value={quota}
            onChange={(e) => setQuota(e.target.value)}
            aria-invalid={!!errors.quota}
            placeholder="cth: 100"
            className="mt-1.5"
          />
          {errors.quota && (
            <p className="mt-1.5 text-sm text-destructive">{errors.quota}</p>
          )}
        </div>
        <div>
          <Label htmlFor="expiresAt">Berlaku Hingga</Label>
          <Input
            id="expiresAt"
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            aria-invalid={!!errors.expiresAt}
            className="mt-1.5"
          />
          {errors.expiresAt && (
            <p className="mt-1.5 text-sm text-destructive">
              {errors.expiresAt}
            </p>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          Buat Voucher
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/vouchers")}
          disabled={isSubmitting}
        >
          Batal
        </Button>
      </div>
    </form>
  );
}