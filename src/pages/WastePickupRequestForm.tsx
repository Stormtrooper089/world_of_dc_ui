import React, { useEffect, useState } from "react";
import { Camera, LocateFixed, Truck } from "lucide-react";
import { wardsService } from "../services/wardsService";
import { wastePickupService } from "../services/wastePickupService";
import { Ward } from "../types";
import {
  WasteCategory,
  WasteQuantityEstimate,
  WasteUrgency,
  wasteCategoryLabels,
  wasteQuantityLabels,
  wasteUrgencyLabels,
} from "../types/wastePickupTypes";

const categoryOptions = Object.keys(wasteCategoryLabels) as WasteCategory[];
const quantityOptions = Object.keys(wasteQuantityLabels) as WasteQuantityEstimate[];
const urgencyOptions = Object.keys(wasteUrgencyLabels) as WasteUrgency[];

const WastePickupRequestForm: React.FC<{ onCancel?: () => void; onSubmitted?: (trackingId: string) => void }> = ({
  onCancel,
  onSubmitted,
}) => {
  const [wards, setWards] = useState<Ward[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState("");
  const [successTrackingId, setSuccessTrackingId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [form, setForm] = useState({
    citizenName: "",
    mobileNumber: "",
    wardNumber: "",
    locality: "",
    landmark: "",
    fullAddress: "",
    latitude: "",
    longitude: "",
    wasteCategory: "HOUSEHOLD_WASTE_NOT_COLLECTED" as WasteCategory,
    estimatedQuantity: "SMALL" as WasteQuantityEstimate,
    urgency: "NORMAL" as WasteUrgency,
    description: "",
    preferredPickupSlot: "",
    vehicleAccessAvailable: "true",
    sensitiveNearbyLocation: "",
  });

  useEffect(() => {
    wardsService.getWards().then(setWards);
  }, []);

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setError("GPS is not available in this browser. Please enter location manually.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateField("latitude", position.coords.latitude.toFixed(6));
        updateField("longitude", position.coords.longitude.toFixed(6));
        setIsLocating(false);
      },
      () => {
        setError("GPS permission denied. Manual address and landmark will be used.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccessTrackingId("");
    if (!form.citizenName.trim() || !form.mobileNumber.trim()) {
      setError("Citizen name and mobile number are required.");
      return;
    }
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("citizenName", form.citizenName);
      formData.append("mobileNumber", form.mobileNumber);
      if (form.wardNumber) formData.append("wardNumber", form.wardNumber);
      formData.append("locality", form.locality);
      formData.append("landmark", form.landmark);
      formData.append("fullAddress", form.fullAddress);
      if (form.latitude) formData.append("latitude", form.latitude);
      if (form.longitude) formData.append("longitude", form.longitude);
      formData.append("wasteCategory", form.wasteCategory);
      formData.append("estimatedQuantity", form.estimatedQuantity);
      formData.append("urgency", form.urgency);
      formData.append("description", form.description);
      formData.append("preferredPickupSlot", form.preferredPickupSlot);
      formData.append("vehicleAccessAvailable", form.vehicleAccessAvailable);
      formData.append("sensitiveNearbyLocation", form.sensitiveNearbyLocation);
      files.forEach((file) => formData.append("beforePhotos", file));

      const request = await wastePickupService.createRequest(formData);
      setSuccessTrackingId(request.trackingId);
      if (onSubmitted) {
        window.setTimeout(() => onSubmitted(request.trackingId), 900);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to submit waste pickup request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {successTrackingId && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Request submitted. Tracking ID: <span className="font-bold">{successTrackingId}</span>
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
        <div className="flex items-center gap-2 text-blue-900">
          <Truck className="h-5 w-5" />
          <p className="font-semibold">SMC Waste Pickup Request</p>
        </div>
        <p className="mt-1 text-sm text-blue-700">
          Submit waste pickup needs with ward, location, GPS and before-pickup evidence.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Citizen name *" value={form.citizenName} onChange={(value) => updateField("citizenName", value)} />
        <Input label="Mobile number *" value={form.mobileNumber} maxLength={10} onChange={(value) => updateField("mobileNumber", value.replace(/\D/g, "").slice(0, 10))} />
        <div>
          <label className="block text-sm font-semibold text-slate-700">Ward</label>
          <select value={form.wardNumber} onChange={(e) => updateField("wardNumber", e.target.value)} className="mt-1 w-full rounded-lg border-slate-300 px-3 py-2.5">
            <option value="">Select ward</option>
            {wards.map((ward) => (
              <option key={ward.wardNumber} value={ward.wardNumber}>Ward {ward.wardNumber}{ward.name ? ` - ${ward.name}` : ""}</option>
            ))}
          </select>
        </div>
        <Input label="Locality / road" value={form.locality} onChange={(value) => updateField("locality", value)} />
        <Input label="Landmark" value={form.landmark} onChange={(value) => updateField("landmark", value)} />
        <Input label="Preferred pickup time slot" value={form.preferredPickupSlot} placeholder="Tomorrow 9 AM - 12 PM" onChange={(value) => updateField("preferredPickupSlot", value)} />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700">Full address</label>
        <textarea value={form.fullAddress} onChange={(e) => updateField("fullAddress", e.target.value)} rows={3} className="mt-1 w-full rounded-lg border-slate-300 px-3 py-2.5" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Select label="Waste category" value={form.wasteCategory} options={categoryOptions.map((value) => ({ value, label: wasteCategoryLabels[value] }))} onChange={(value) => updateField("wasteCategory", value)} />
        <Select label="Estimated quantity" value={form.estimatedQuantity} options={quantityOptions.map((value) => ({ value, label: wasteQuantityLabels[value] }))} onChange={(value) => updateField("estimatedQuantity", value)} />
        <Select label="Urgency" value={form.urgency} options={urgencyOptions.map((value) => ({ value, label: wasteUrgencyLabels[value] }))} onChange={(value) => updateField("urgency", value)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Select label="Vehicle access available?" value={form.vehicleAccessAvailable} options={[{ value: "true", label: "Yes" }, { value: "false", label: "No" }]} onChange={(value) => updateField("vehicleAccessAvailable", value)} />
        <Input label="Near school / hospital / market / drain / waterbody" value={form.sensitiveNearbyLocation} onChange={(value) => updateField("sensitiveNearbyLocation", value)} />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700">Description</label>
        <textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} rows={3} className="mt-1 w-full rounded-lg border-slate-300 px-3 py-2.5" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <button type="button" onClick={captureLocation} disabled={isLocating} className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700">
          <LocateFixed className="h-4 w-4" />
          {isLocating ? "Capturing..." : "Capture GPS"}
        </button>
        <p className="mt-2 text-sm text-slate-600">
          {form.latitude && form.longitude ? `${form.latitude}, ${form.longitude}` : "GPS optional. Manual address is allowed if permission is denied."}
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700">Photos before pickup</label>
        <label className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
          <Camera className="h-5 w-5" />
          Upload before photos
          <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
        </label>
        {files.length > 0 && <p className="mt-2 text-sm text-slate-500">{files.length} photo(s) selected</p>}
      </div>

      <div className="flex gap-3 border-t border-slate-100 pt-4">
        {onCancel && (
          <button type="button" onClick={onCancel} className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-700">Cancel</button>
        )}
        <button type="submit" disabled={isSubmitting} className="flex-1 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </button>
      </div>
    </form>
  );
};

const Input = ({ label, value, onChange, placeholder, maxLength }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; maxLength?: number }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700">{label}</label>
    <input value={value} maxLength={maxLength} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border-slate-300 px-3 py-2.5" />
  </div>
);

const Select = ({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700">{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border-slate-300 px-3 py-2.5">
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  </div>
);

export default WastePickupRequestForm;
