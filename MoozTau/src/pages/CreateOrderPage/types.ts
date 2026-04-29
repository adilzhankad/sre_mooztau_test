export interface DraftItem {
  id: string; // uuid для UI

  product_id: number;
  model: string;
  category: string;

  quantity: number;
  unit: string;
  color: string;
  available_colors: string[];

  // Размеры (опционально, для погонных/площадных товаров)
  length?: number;
  height?: number;
  width?: number;

  base_price: number;
  price_per_unit: number;
  recommended_price: number;

  discount_percent: number;
  discount_amount: number; // вычисляется автоматически

  total_price: number;
}

// ── Собранные данные клиента (индивидуальный / юр. лицо) ──
export interface IndividualClient {
  type: "individual";
  name: string;
  iin: string;

  phone: string;

  region: string;
  district: string;
  address: string;
}

export interface LegalClient {
  type: "legal";
  companyName: string;
  bin: string;
  director: string;

  phone: string;

  iik: string;
  bik: string;
  bankName: string;
  legalAddress: string;

  region: string;
  district: string;
  address: string;
}

export type ClientData = IndividualClient | LegalClient;
