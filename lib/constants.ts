export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
  "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
] as const;

export const INDUSTRY_OPTIONS = [
  { value: "mobile", label: "Mobile & Accessories" },
  { value: "pharmacy", label: "Pharmacy & Medical" },
  { value: "kirana", label: "Kirana & Grocery" },
  { value: "garments", label: "Garments & Apparel" },
  { value: "electronics", label: "Electronics" },
  { value: "custom", label: "Custom/Other" },
] as const;

export const DEFAULT_CREDIT_LIMIT = 500;
export const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const DEFAULT_TERMS = `1. Goods once sold cannot be returned or exchanged unless damaged or defective at the time of delivery.
2. Payment is due within the agreed credit period.
3. Interest @24% p.a. will be charged on overdue payments.
4. All disputes are subject to local jurisdiction only.
5. E. & O.E.`;
