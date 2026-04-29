import type {
  Order,
  OrderHistory,
  Payment,
  Product,
  Price,
  FinCategory,
  BankAccount,
  FinTransaction,
  ReportSummary,
  CategoryBreakdown,
  MeResponse,
  TokenResponse,
  User,
  Organization,
} from "@/types";

// Auth

export const MOCK_ORGANIZATIONS: Organization[] = [
  {
    id: 1,
    name: "MoozTau HQ",
    org_type: "HQ",
    is_active: true,
    contact_phone: "+7 700 000 00 01",
    contact_email: "hq@mooztau.kz",
    address: "г. Алматы, ул. Сатпаева 22",
    region: "Алматы",
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "ТОО «Холод Алматы»",
    org_type: "DEALER",
    is_active: true,
    contact_phone: "+7 727 300 10 10",
    contact_email: "almaty@dealer.mooztau.kz",
    address: "г. Алматы, ул. Абая 150",
    region: "Алматы",
    created_at: "2025-01-12T00:00:00Z",
  },
  {
    id: 3,
    name: "ИП Жумабеков",
    org_type: "DEALER",
    is_active: true,
    contact_phone: "+7 725 255 44 66",
    contact_email: "shym@dealer.mooztau.kz",
    address: "г. Шымкент, ул. Тауке хана 45",
    region: "Шымкент",
    created_at: "2025-02-01T00:00:00Z",
  },
  {
    id: 4,
    name: "ТОО «Северный холод»",
    org_type: "DEALER",
    is_active: true,
    contact_phone: "+7 717 255 77 88",
    contact_email: "astana@dealer.mooztau.kz",
    address: "г. Астана, пр. Мангилик Ел 51",
    region: "Астана",
    created_at: "2025-02-15T00:00:00Z",
  },
];

export const MOCK_USERS: User[] = [
  { id: 1, organization_id: 1, role: "SUPER_ADMIN", full_name: "Админ Тестов", phone: "+77000000001", email: "admin@mooztau.kz", is_active: true },
  { id: 2, organization_id: 2, role: "DEALER_ADMIN", full_name: "Абдрахманов Нурлан", phone: "+77000000002", email: "nurlan@dealer.mooztau.kz", is_active: true },
  { id: 3, organization_id: 2, role: "DEALER_MANAGER", full_name: "Серикова Айгуль", phone: "+77000000003", email: "aigul@dealer.mooztau.kz", is_active: true },
  { id: 4, organization_id: 1, role: "FACTORY_ADMIN", full_name: "Мастер Цеха", phone: "+77000000004", email: "factory@mooztau.kz", is_active: true },
  { id: 5, organization_id: 3, role: "DEALER_MANAGER", full_name: "Жумабеков Асхат", phone: "+77000000005", email: "askhat@dealer.mooztau.kz", is_active: true },
  { id: 6, organization_id: 2, role: "DEALER_MANAGER", full_name: "Тлеубергенов Арман", phone: "+77000000006", email: "arman@dealer.mooztau.kz", is_active: true },
  { id: 7, organization_id: 3, role: "DEALER_ADMIN", full_name: "Жумабекова Алина", phone: "+77000000007", email: "alina@dealer.mooztau.kz", is_active: true },
  { id: 8, organization_id: 1, role: "QC_INSPECTOR", full_name: "Ермеков Даурен", phone: "+77000000008", email: "qc@mooztau.kz", is_active: true },
  { id: 9, organization_id: 1, role: "LOGISTICS", full_name: "Курманов Руслан", phone: "+77000000009", email: "logistics@mooztau.kz", is_active: true },
  { id: 10, organization_id: 4, role: "DEALER_MANAGER", full_name: "Искаков Марат", phone: "+77000000010", email: "marat@dealer.mooztau.kz", is_active: true },
  { id: 11, organization_id: 4, role: "DEALER_ADMIN", full_name: "Сапарова Лаура", phone: "+77000000011", email: "laura@dealer.mooztau.kz", is_active: true },
];

export const MOCK_USER_PASSWORDS: Record<number, string> = {
  1: "admin123",
  2: "admin123",
  3: "manager123",
  4: "factory123",
  5: "manager123",
  6: "manager123",
  7: "admin123",
  8: "qc123",
  9: "log123",
  10: "manager123",
  11: "admin123",
};

const DEFAULT_STAFF_USER = MOCK_USERS[0];
const DEFAULT_STAFF_ORGANIZATION = MOCK_ORGANIZATIONS[0];

export const MOCK_TOKEN_RESPONSE: TokenResponse = {
  access_token: "mock-access-token-user-1",
  refresh_token: "mock-refresh-token-user-1",
  token_type: "bearer",
  user_id: DEFAULT_STAFF_USER.id,
  role: DEFAULT_STAFF_USER.role,
  organization_id: DEFAULT_STAFF_USER.organization_id,
  full_name: DEFAULT_STAFF_USER.full_name,
};

export const MOCK_ME: MeResponse = {
  id: DEFAULT_STAFF_USER.id,
  phone: DEFAULT_STAFF_USER.phone,
  full_name: DEFAULT_STAFF_USER.full_name,
  email: DEFAULT_STAFF_USER.email,
  role: DEFAULT_STAFF_USER.role,
  organization_id: DEFAULT_STAFF_USER.organization_id,
  organization_name: DEFAULT_STAFF_ORGANIZATION.name,
  is_active: DEFAULT_STAFF_USER.is_active,
};

// Products

export const MOCK_PRICES: Price[] = [
  { id: 1, product_id: 1, dealer_price: 450000, recommended_price: 520000, price_per_meter: null, effective_from: "2025-01-01", effective_to: null, created_at: "2025-01-01T00:00:00Z" },
  { id: 2, product_id: 2, dealer_price: 380000, recommended_price: 440000, price_per_meter: null, effective_from: "2025-01-01", effective_to: null, created_at: "2025-01-01T00:00:00Z" },
  { id: 3, product_id: 3, dealer_price: 620000, recommended_price: 720000, price_per_meter: null, effective_from: "2025-01-01", effective_to: null, created_at: "2025-01-01T00:00:00Z" },
  { id: 4, product_id: 4, dealer_price: null, recommended_price: null, price_per_meter: 45000, effective_from: "2025-01-01", effective_to: null, created_at: "2025-01-01T00:00:00Z" },
  { id: 5, product_id: 5, dealer_price: 180000, recommended_price: 210000, price_per_meter: null, effective_from: "2025-01-01", effective_to: null, created_at: "2025-01-01T00:00:00Z" },
  { id: 6, product_id: 6, dealer_price: 85000, recommended_price: 105000, price_per_meter: null, effective_from: "2025-01-01", effective_to: null, created_at: "2025-01-01T00:00:00Z" },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: 1, model: "MT-200B", name: "Камера холодильная встраиваемая 200", description: "Встраиваемая холодильная камера объёмом 200л", category: "BUILT_IN", unit: "шт", image_url: null, default_length: 1200, default_height: 2100, default_width: 800, available_colors: "Белый,Серебро,Антрацит", is_active: true, created_at: "2025-01-01T00:00:00Z" },
  { id: 2, model: "MT-150B", name: "Камера холодильная встраиваемая 150", description: "Компактная встраиваемая камера", category: "BUILT_IN", unit: "шт", image_url: null, default_length: 1000, default_height: 2100, default_width: 700, available_colors: "Белый,Серебро", is_active: true, created_at: "2025-01-01T00:00:00Z" },
  { id: 3, model: "MT-300O", name: "Камера уличная 300", description: "Уличная холодильная камера повышенной прочности", category: "OUTDOOR", unit: "шт", image_url: null, default_length: 2000, default_height: 2200, default_width: 1200, available_colors: "Белый,RAL 7035", is_active: true, created_at: "2025-01-01T00:00:00Z" },
  { id: 4, model: "MT-PNL", name: "Панель сэндвич 80мм", description: "Сэндвич-панель для сборки камер", category: "WITHOUT_UNIT", unit: "метр", image_url: null, default_length: null, default_height: 2200, default_width: 80, available_colors: "Белый", is_active: true, created_at: "2025-01-01T00:00:00Z" },
  { id: 5, model: "MT-AGR-1", name: "Агрегат холодильный 1кВт", description: "Холодильный агрегат мощностью 1кВт", category: "UNIT", unit: "шт", image_url: null, default_length: null, default_height: null, default_width: null, available_colors: "", is_active: true, created_at: "2025-01-01T00:00:00Z" },
  { id: 6, model: "MT-DOOR-S", name: "Дверь распашная стандарт", description: "Стандартная распашная дверь для камеры", category: "DOOR", unit: "шт", image_url: null, default_length: 800, default_height: 1900, default_width: 80, available_colors: "Белый,Серебро,RAL 7035", is_active: true, created_at: "2025-01-01T00:00:00Z" },
];

// Helper to build orders

function makePayment(id: number, order_id: number, amount: number, date: string, method: string, notes: string): Payment {
  return { id, order_id, amount, payment_date: date, payment_method: method, notes, created_at: `${date}T12:00:00Z` };
}

const P1: Payment[] = [makePayment(1, 1, 730000, "2025-12-12", "Kaspi", "Предоплата 50%")];
const P3: Payment[] = [makePayment(2, 3, 400000, "2026-03-17", "Halyk", "")];
const P4: Payment[] = [makePayment(3, 4, 260000, "2026-02-22", "Kaspi", "Предоплата"), makePayment(4, 4, 260000, "2026-03-10", "Наличные", "Доплата")];
const P5: Payment[] = [makePayment(5, 5, 500000, "2026-01-12", "Halyk", ""), makePayment(6, 5, 500000, "2026-02-05", "Kaspi", "")];
const P6: Payment[] = [makePayment(7, 6, 220000, "2025-11-07", "Kaspi", "Предоплата"), makePayment(8, 6, 220000, "2025-12-05", "Наличные", "Окончательная оплата")];
const P7: Payment[] = [makePayment(9, 7, 500000, "2026-03-01", "Перевод", "")];
const P8: Payment[] = [makePayment(10, 8, 300000, "2026-04-03", "Kaspi", "Аванс по новому заказу")];
const P10: Payment[] = [makePayment(11, 10, 500000, "2026-04-06", "Halyk", "Первый платёж"), makePayment(12, 10, 535000, "2026-04-12", "Kaspi", "Закрытие суммы")];
const P11: Payment[] = [makePayment(13, 11, 150000, "2026-04-08", "Kaspi", "Частичная предоплата")];
const P12: Payment[] = [makePayment(14, 12, 600000, "2026-03-30", "Перевод", "Предоплата"), makePayment(15, 12, 300000, "2026-04-14", "Kaspi", "Второй платёж")];

const TS = "2026-01-01T00:00:00Z";
const ORDER_DEFAULTS = {
  client_iin: "880101300123",
  client_type: "individual",
  company_director: "",
  company_bin: "",
  company_iik: null,
  company_bik: null,
  company_bank_name: null,
  company_legal_address: null,
  delivery_address: "",
  discount_percent: 0,
  discount_amount: 0,
  final_amount: 0,
  payment_type: "card",
  payment_status: "partial" as const,
  completed_at: null,
} satisfies Partial<Order>;

export const MOCK_ORDERS: Order[] = [
  {
    id: 1, order_number: "MZ-000001", status: "in_progress",
    client_name: "Ахметов Болат", client_phone: "+7 701 111 22 33",
    client_region: "Алматы", client_address: "ул. Абая 150, офис 12",
    contract_number: "D-2025-001", organization_id: 2, manager_id: 3,
    factory: "Основной цех", manufacturer: "Кулан", sales_channel: "MoozTau",
    total_amount: 1460000, dealer_cost: 1280000,
    order_date: "2025-12-10", deadline: "2026-01-15",
    accepted_date: null, warranty_end_date: null, has_contract: true, contract_status: "signed" as const,
    items: [
      { id: 1, product_id: 1, model: "MT-200B", category: "BUILT_IN", quantity: 2, unit: "шт", length: 1200, height: 2100, width: 800, color: "Белый", price_per_unit: 520000, total_price: 1040000 },
      { id: 2, product_id: 5, model: "MT-AGR-1", category: "UNIT", quantity: 2, unit: "шт", length: null, height: null, width: null, color: "Серебро", price_per_unit: 210000, total_price: 420000 },
    ],
    payments: P1,
    payment_received: 730000, payment_remaining: 730000,
    organization_name: "ТОО «Холод Алматы»", manager_name: "Серикова Айгуль", manager_phone: "+77000000003",
    buyer_id: 1, courier_name: null, courier_phone: null, dispatch_date: null, dispatch_photo_url: null, delivery_photo_url: null,
    created_at: TS, updated_at: TS,
  },
  {
    id: 2, order_number: "MZ-000002", status: "analysis",
    client_name: "Касымов Ержан", client_phone: "+7 702 333 44 55",
    client_region: "Астана", client_address: "пр. Мангилик Ел 28",
    contract_number: "D-2026-002", organization_id: 2, manager_id: 3,
    factory: "Основной цех", manufacturer: "Тараз", sales_channel: "МТ Астана",
    total_amount: 720000, dealer_cost: 620000,
    order_date: "2026-03-25", deadline: "2026-04-20",
    accepted_date: null, warranty_end_date: null, has_contract: false, contract_status: null,
    items: [
      { id: 3, product_id: 3, model: "MT-300O", category: "OUTDOOR", quantity: 1, unit: "шт", length: 2000, height: 2200, width: 1200, color: "RAL 7035", price_per_unit: 720000, total_price: 720000 },
    ],
    payments: [],
    payment_received: 0, payment_remaining: 720000,
    organization_name: "ТОО «Холод Алматы»", manager_name: "Серикова Айгуль", manager_phone: "+77000000003",
    buyer_id: 1, courier_name: null, courier_phone: null, dispatch_date: null, dispatch_photo_url: null, delivery_photo_url: null,
    created_at: TS, updated_at: TS,
  },
  {
    id: 3, order_number: "MZ-000003", status: "qc_review",
    client_name: "Нурланова Дана", client_phone: "+7 705 666 77 88",
    client_region: "Шымкент", client_address: "ул. Тауке хана 45",
    contract_number: "D-2025-003", organization_id: 3, manager_id: 5,
    factory: "Основной цех", manufacturer: "Кулан", sales_channel: "Umag Шым",
    total_amount: 835000, dealer_cost: 715000,
    order_date: "2026-03-15", deadline: "2026-04-10",
    accepted_date: null, warranty_end_date: null, has_contract: true, contract_status: "signed" as const,
    items: [
      { id: 4, product_id: 2, model: "MT-150B", category: "BUILT_IN", quantity: 1, unit: "шт", length: 1000, height: 2100, width: 700, color: "Серебро", price_per_unit: 440000, total_price: 440000 },
      { id: 5, product_id: 5, model: "MT-AGR-1", category: "UNIT", quantity: 1, unit: "шт", length: null, height: null, width: null, color: "Серебро", price_per_unit: 210000, total_price: 210000 },
      { id: 6, product_id: 6, model: "MT-DOOR-S", category: "DOOR", quantity: 1, unit: "шт", length: 800, height: 1900, width: 80, color: "Серебро", price_per_unit: 105000, total_price: 105000 },
      { id: 7, product_id: 4, model: "MT-PNL", category: "WITHOUT_UNIT", quantity: 2, unit: "метр", length: null, height: 2200, width: 80, color: "Белый", price_per_unit: 40000, total_price: 80000 },
    ],
    payments: P3,
    payment_received: 400000, payment_remaining: 435000,
    organization_name: "ИП Жумабеков", manager_name: "Жумабеков Асхат", manager_phone: "+77000000005",
    buyer_id: 1, courier_name: null, courier_phone: null, dispatch_date: null, dispatch_photo_url: null, delivery_photo_url: null,
    created_at: TS, updated_at: TS,
  },
  {
    id: 4, order_number: "MZ-000004", status: "in_transit",
    client_name: "Бакытов Тимур", client_phone: "+7 700 999 00 11",
    client_region: "Караганда", client_address: "ул. Бухар Жырау 70",
    contract_number: "D-2025-004", organization_id: 3, manager_id: 5,
    factory: "Основной цех", manufacturer: "Тараз", sales_channel: "B2B",
    total_amount: 520000, dealer_cost: 450000,
    order_date: "2026-02-20", deadline: "2026-03-15",
    accepted_date: null, warranty_end_date: null, has_contract: true, contract_status: "signed" as const,
    items: [
      { id: 8, product_id: 1, model: "MT-200B", category: "BUILT_IN", quantity: 1, unit: "шт", length: 1200, height: 2100, width: 800, color: "Антрацит", price_per_unit: 520000, total_price: 520000 },
    ],
    payments: P4,
    payment_received: 520000, payment_remaining: 0,
    organization_name: "ИП Жумабеков", manager_name: "Жумабеков Асхат", manager_phone: "+77000000005",
    buyer_id: 1, courier_name: null, courier_phone: null, dispatch_date: null, dispatch_photo_url: null, delivery_photo_url: null,
    created_at: TS, updated_at: TS,
  },
  {
    id: 5, order_number: "MZ-000005", status: "completed",
    client_name: "Сулейменов Марат", client_phone: "+7 708 222 33 44",
    client_region: "Алматы", client_address: "мкр. Орбита-2, д. 14",
    contract_number: "D-2025-005", organization_id: 2, manager_id: 3,
    factory: "Основной цех", manufacturer: "Кулан", sales_channel: "МТ Алматы",
    total_amount: 1250000, dealer_cost: 1068000,
    order_date: "2026-01-10", deadline: "2026-02-10",
    accepted_date: "2026-02-08", warranty_end_date: "2027-02-08", has_contract: true, contract_status: "signed" as const,
    items: [
      { id: 9, product_id: 3, model: "MT-300O", category: "OUTDOOR", quantity: 1, unit: "шт", length: 2000, height: 2200, width: 1200, color: "Белый", price_per_unit: 720000, total_price: 720000 },
      { id: 10, product_id: 5, model: "MT-AGR-1", category: "UNIT", quantity: 1, unit: "шт", length: null, height: null, width: null, color: "Серебро", price_per_unit: 210000, total_price: 210000 },
      { id: 11, product_id: 6, model: "MT-DOOR-S", category: "DOOR", quantity: 2, unit: "шт", length: 800, height: 1900, width: 80, color: "Белый", price_per_unit: 105000, total_price: 210000 },
      { id: 12, product_id: 4, model: "MT-PNL", category: "WITHOUT_UNIT", quantity: 2.5, unit: "метр", length: null, height: 2200, width: 80, color: "Белый", price_per_unit: 44000, total_price: 110000 },
    ],
    payments: P5,
    payment_received: 1000000, payment_remaining: 250000,
    organization_name: "ТОО «Холод Алматы»", manager_name: "Серикова Айгуль", manager_phone: "+77000000003",
    buyer_id: 1, courier_name: "Курманов Руслан", courier_phone: "+77000000009", dispatch_date: "2026-02-05",
    dispatch_photo_url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
    delivery_photo_url: "https://images.unsplash.com/photo-1612966809470-6f4d7a9fd2eb?auto=format&fit=crop&w=800&q=80",
    created_at: TS, updated_at: TS,
  },
  {
    id: 6, order_number: "MZ-000006", status: "completed",
    client_name: "Ким Виктория", client_phone: "+7 701 555 66 77",
    client_region: "Алматы", client_address: "ул. Розыбакиева 220",
    contract_number: "D-2024-042", organization_id: 2, manager_id: 3,
    factory: "Основной цех", manufacturer: "Кулан", sales_channel: "Каспи Магазин",
    total_amount: 440000, dealer_cost: 380000,
    order_date: "2025-11-05", deadline: "2025-12-01",
    accepted_date: "2025-12-08", warranty_end_date: "2026-12-08", has_contract: true, contract_status: "signed" as const,
    items: [
      { id: 13, product_id: 2, model: "MT-150B", category: "BUILT_IN", quantity: 1, unit: "шт", length: 1000, height: 2100, width: 700, color: "Белый", price_per_unit: 440000, total_price: 440000 },
    ],
    payments: P6,
    payment_received: 440000, payment_remaining: 0,
    organization_name: "ТОО «Холод Алматы»", manager_name: "Серикова Айгуль", manager_phone: "+77000000003",
    buyer_id: 1, courier_name: "Курманов Руслан", courier_phone: "+77000000009", dispatch_date: "2025-12-05",
    dispatch_photo_url: "https://images.unsplash.com/photo-1495556650867-99590cea3657?auto=format&fit=crop&w=800&q=80",
    delivery_photo_url: "https://images.unsplash.com/photo-1579208575657-c595a05383b7?auto=format&fit=crop&w=800&q=80",
    completed_at: "2025-12-08T16:30:00Z",
    created_at: TS, updated_at: TS,
  },
  {
    id: 7, order_number: "MZ-000007", status: "in_transit",
    client_name: "Оспанов Даурен", client_phone: "+7 707 888 99 00",
    client_region: "Актобе", client_address: "пр. Абилкайыр хана 65",
    contract_number: "D-2025-007", organization_id: 3, manager_id: 5,
    factory: "Основной цех", manufacturer: "Тараз", sales_channel: "Umag Тараз",
    total_amount: 935000, dealer_cost: 810000,
    order_date: "2026-02-28", deadline: "2026-03-25",
    accepted_date: null, warranty_end_date: null, has_contract: true, contract_status: "signed" as const,
    items: [
      { id: 14, product_id: 1, model: "MT-200B", category: "BUILT_IN", quantity: 1, unit: "шт", length: 1200, height: 2100, width: 800, color: "Серебро", price_per_unit: 520000, total_price: 520000 },
      { id: 15, product_id: 5, model: "MT-AGR-1", category: "UNIT", quantity: 1, unit: "шт", length: null, height: null, width: null, color: "Серебро", price_per_unit: 210000, total_price: 210000 },
      { id: 16, product_id: 6, model: "MT-DOOR-S", category: "DOOR", quantity: 1, unit: "шт", length: 800, height: 1900, width: 80, color: "Серебро", price_per_unit: 105000, total_price: 105000 },
      { id: 17, product_id: 4, model: "MT-PNL", category: "WITHOUT_UNIT", quantity: 2.2, unit: "метр", length: null, height: 2200, width: 80, color: "Белый", price_per_unit: 45000, total_price: 100000 },
    ],
    payments: P7,
    payment_received: 500000, payment_remaining: 435000,
    organization_name: "ИП Жумабеков", manager_name: "Жумабеков Асхат", manager_phone: "+77000000005",
    buyer_id: 1, courier_name: null, courier_phone: null, dispatch_date: null, dispatch_photo_url: null, delivery_photo_url: null,
    created_at: TS, updated_at: TS,
  },
  {
    id: 8, order_number: "MZ-000008", status: "in_progress",
    client_name: "Нургалиев Самат", client_phone: "+7 705 111 22 44",
    client_region: "Алматы", client_address: "мкр. Акбулак 17",
    contract_number: "D-2026-008", organization_id: 2, manager_id: 6,
    factory: "Основной цех", manufacturer: "Кулан", sales_channel: "MoozTau",
    total_amount: 979000, dealer_cost: 842000,
    order_date: "2026-04-02", deadline: "2026-04-29",
    accepted_date: null, warranty_end_date: null, has_contract: true, contract_status: "signed" as const,
    items: [
      { id: 18, product_id: 1, model: "MT-200B", category: "BUILT_IN", quantity: 1, unit: "шт", length: 1200, height: 2100, width: 800, color: "Белый", price_per_unit: 520000, total_price: 520000 },
      { id: 19, product_id: 5, model: "MT-AGR-1", category: "UNIT", quantity: 1, unit: "шт", length: null, height: null, width: null, color: "Серебро", price_per_unit: 210000, total_price: 210000 },
      { id: 20, product_id: 6, model: "MT-DOOR-S", category: "DOOR", quantity: 1, unit: "шт", length: 800, height: 1900, width: 80, color: "Белый", price_per_unit: 105000, total_price: 105000 },
      { id: 21, product_id: 4, model: "MT-PNL", category: "WITHOUT_UNIT", quantity: 3.2, unit: "метр", length: null, height: 2200, width: 80, color: "Белый", price_per_unit: 45000, total_price: 144000 },
    ],
    payments: P8,
    payment_received: 300000, payment_remaining: 679000,
    organization_name: "ТОО «Холод Алматы»", manager_name: "Тлеубергенов Арман", manager_phone: "+77000000006",
    buyer_id: 1, courier_name: null, courier_phone: null, dispatch_date: null, dispatch_photo_url: null, delivery_photo_url: null,
    created_at: TS, updated_at: TS,
  },
  {
    id: 9, order_number: "MZ-000009", status: "qc_passed",
    client_name: "Турсынбекова Асем", client_phone: "+7 701 444 11 22",
    client_region: "Шымкент", client_address: "мкр. Нурсат 54",
    contract_number: "D-2026-009", organization_id: 3, manager_id: 5,
    factory: "Основной цех", manufacturer: "Кулан", sales_channel: "Umag Шым",
    total_amount: 635000, dealer_cost: 545000,
    order_date: "2026-04-01", deadline: "2026-04-24",
    accepted_date: null, warranty_end_date: null, has_contract: true, contract_status: "signed" as const,
    items: [
      { id: 22, product_id: 2, model: "MT-150B", category: "BUILT_IN", quantity: 1, unit: "шт", length: 1000, height: 2100, width: 700, color: "Белый", price_per_unit: 440000, total_price: 440000 },
      { id: 23, product_id: 6, model: "MT-DOOR-S", category: "DOOR", quantity: 1, unit: "шт", length: 800, height: 1900, width: 80, color: "Серебро", price_per_unit: 105000, total_price: 105000 },
      { id: 24, product_id: 4, model: "MT-PNL", category: "WITHOUT_UNIT", quantity: 2, unit: "метр", length: null, height: 2200, width: 80, color: "Белый", price_per_unit: 45000, total_price: 90000 },
    ],
    payments: [],
    payment_received: 0, payment_remaining: 635000,
    organization_name: "ИП Жумабеков", manager_name: "Жумабеков Асхат", manager_phone: "+77000000005",
    buyer_id: 1, courier_name: null, courier_phone: null, dispatch_date: null, dispatch_photo_url: null, delivery_photo_url: null,
    created_at: TS, updated_at: TS,
  },
  {
    id: 10, order_number: "MZ-000010", status: "waiting_courier",
    client_name: "Сергалиев Олжас", client_phone: "+7 705 222 88 99",
    client_region: "Астана", client_address: "ул. Сарайшык 12",
    contract_number: "D-2026-010", organization_id: 4, manager_id: 10,
    factory: "Основной цех", manufacturer: "Тараз", sales_channel: "МТ Астана",
    total_amount: 1035000, dealer_cost: 895000,
    order_date: "2026-04-05", deadline: "2026-04-27",
    accepted_date: null, warranty_end_date: null, has_contract: true, contract_status: "signed" as const,
    items: [
      { id: 25, product_id: 3, model: "MT-300O", category: "OUTDOOR", quantity: 1, unit: "шт", length: 2000, height: 2200, width: 1200, color: "RAL 7035", price_per_unit: 720000, total_price: 720000 },
      { id: 26, product_id: 5, model: "MT-AGR-1", category: "UNIT", quantity: 1, unit: "шт", length: null, height: null, width: null, color: "Серебро", price_per_unit: 210000, total_price: 210000 },
      { id: 27, product_id: 6, model: "MT-DOOR-S", category: "DOOR", quantity: 1, unit: "шт", length: 800, height: 1900, width: 80, color: "Белый", price_per_unit: 105000, total_price: 105000 },
    ],
    payments: P10,
    payment_received: 1035000, payment_remaining: 0,
    organization_name: "ТОО «Северный холод»", manager_name: "Искаков Марат", manager_phone: "+77000000010",
    buyer_id: 1, courier_name: "Курманов Руслан", courier_phone: "+77000000009", dispatch_date: "2026-04-15",
    dispatch_photo_url: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80",
    delivery_photo_url: null,
    created_at: TS, updated_at: TS,
  },
  {
    id: 11, order_number: "MZ-000011", status: "analysis",
    client_name: "Абилов Руслан", client_phone: "+7 701 333 45 67",
    client_region: "Алматы", client_address: "пр. Гагарина 201",
    contract_number: "D-2026-011", organization_id: 2, manager_id: 3,
    factory: "Основной цех", manufacturer: "Кулан", sales_channel: "Каспи Магазин",
    total_amount: 730000, dealer_cost: 630000,
    order_date: "2026-04-07", deadline: "2026-05-02",
    accepted_date: null, warranty_end_date: null, has_contract: true, contract_status: "created" as const,
    items: [
      { id: 28, product_id: 1, model: "MT-200B", category: "BUILT_IN", quantity: 1, unit: "шт", length: 1200, height: 2100, width: 800, color: "Серебро", price_per_unit: 520000, total_price: 520000 },
      { id: 29, product_id: 5, model: "MT-AGR-1", category: "UNIT", quantity: 1, unit: "шт", length: null, height: null, width: null, color: "Серебро", price_per_unit: 210000, total_price: 210000 },
    ],
    payments: P11,
    payment_received: 150000, payment_remaining: 580000,
    organization_name: "ТОО «Холод Алматы»", manager_name: "Серикова Айгуль", manager_phone: "+77000000003",
    buyer_id: 1, courier_name: null, courier_phone: null, dispatch_date: null, dispatch_photo_url: null, delivery_photo_url: null,
    created_at: TS, updated_at: TS,
  },
  {
    id: 12, order_number: "MZ-000012", status: "completed",
    client_name: "Жанабаев Ерлан", client_phone: "+7 708 999 12 34",
    client_region: "Кокшетау", client_address: "ул. Абылай хана 88",
    contract_number: "D-2026-012", organization_id: 4, manager_id: 10,
    factory: "Основной цех", manufacturer: "Тараз", sales_channel: "Диллер Болат",
    total_amount: 1320000, dealer_cost: 1130000,
    order_date: "2026-03-28", deadline: "2026-04-18",
    accepted_date: "2026-04-18", warranty_end_date: "2027-04-18", has_contract: true, contract_status: "signed" as const,
    items: [
      { id: 30, product_id: 3, model: "MT-300O", category: "OUTDOOR", quantity: 1, unit: "шт", length: 2000, height: 2200, width: 1200, color: "Белый", price_per_unit: 720000, total_price: 720000 },
      { id: 31, product_id: 5, model: "MT-AGR-1", category: "UNIT", quantity: 1, unit: "шт", length: null, height: null, width: null, color: "Серебро", price_per_unit: 210000, total_price: 210000 },
      { id: 32, product_id: 6, model: "MT-DOOR-S", category: "DOOR", quantity: 2, unit: "шт", length: 800, height: 1900, width: 80, color: "Серебро", price_per_unit: 105000, total_price: 210000 },
      { id: 33, product_id: 4, model: "MT-PNL", category: "WITHOUT_UNIT", quantity: 4, unit: "метр", length: null, height: 2200, width: 80, color: "Белый", price_per_unit: 45000, total_price: 180000 },
    ],
    payments: P12,
    payment_received: 900000, payment_remaining: 420000,
    organization_name: "ТОО «Северный холод»", manager_name: "Искаков Марат", manager_phone: "+77000000010",
    buyer_id: 1, courier_name: "Курманов Руслан", courier_phone: "+77000000009", dispatch_date: "2026-04-12",
    dispatch_photo_url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
    delivery_photo_url: "https://images.unsplash.com/photo-1591768575189-c43e8a1e8aa5?auto=format&fit=crop&w=800&q=80",
    created_at: TS, updated_at: TS,
  },
].map((order): Order => ({
  ...ORDER_DEFAULTS,
  final_amount: order.total_amount,
  delivery_address: order.client_address,
  payment_type: "cash",
  ...order,
  status: order.status as Order["status"],
}));

// Order History

export const MOCK_HISTORY: Record<number, OrderHistory[]> = {
  1: [
    { id: 1, order_id: 1, action: "created", old_value: null, new_value: "ANALYSIS", note: null, created_at: "2025-12-10T09:00:00Z", user_id: 3, user_name: "Серикова Айгуль" },
    { id: 2, order_id: 1, action: "status_changed", old_value: "ANALYSIS", new_value: "IN_WORK", note: "Взят в работу", created_at: "2025-12-11T14:30:00Z", user_id: 1, user_name: "Админ Тестов" },
    { id: 3, order_id: 1, action: "payment_added", old_value: null, new_value: "730000", note: "Kaspi перевод", created_at: "2025-12-12T10:15:00Z", user_id: 3, user_name: "Серикова Айгуль" },
    { id: 4, order_id: 1, action: "status_changed", old_value: "IN_WORK", new_value: "APPROVAL", note: null, created_at: "2025-12-13T08:00:00Z", user_id: 4, user_name: "Мастер Цеха" },
  ],
  2: [
    { id: 5, order_id: 2, action: "created", old_value: null, new_value: "ANALYSIS", note: null, created_at: "2026-03-25T11:00:00Z", user_id: 3, user_name: "Серикова Айгуль" },
  ],
  3: [
    { id: 6, order_id: 3, action: "created", old_value: null, new_value: "ANALYSIS", note: null, created_at: "2026-03-15T10:00:00Z", user_id: 5, user_name: "Жумабеков Асхат" },
    { id: 7, order_id: 3, action: "status_changed", old_value: "ANALYSIS", new_value: "APPROVAL", note: null, created_at: "2026-03-16T09:00:00Z", user_id: 1, user_name: "Админ Тестов" },
    { id: 8, order_id: 3, action: "payment_added", old_value: null, new_value: "400000", note: "Halyk перевод", created_at: "2026-03-17T15:00:00Z", user_id: 5, user_name: "Жумабеков Асхат" },
  ],
  8: [
    { id: 9, order_id: 8, action: "created", old_value: null, new_value: "ANALYSIS", note: "Новый клиент по Алматы", created_at: "2026-04-02T09:10:00Z", user_id: 6, user_name: "Тлеубергенов Арман" },
    { id: 10, order_id: 8, action: "payment_added", old_value: null, new_value: "300000", note: "Аванс от клиента", created_at: "2026-04-03T13:20:00Z", user_id: 6, user_name: "Тлеубергенов Арман" },
  ],
  10: [
    { id: 11, order_id: 10, action: "created", old_value: null, new_value: "ANALYSIS", note: null, created_at: "2026-04-05T10:00:00Z", user_id: 10, user_name: "Искаков Марат" },
    { id: 12, order_id: 10, action: "status_changed", old_value: "ANALYSIS", new_value: "IN_WORK", note: "Подтверждён дилером", created_at: "2026-04-06T11:30:00Z", user_id: 11, user_name: "Сапарова Лаура" },
    { id: 13, order_id: 10, action: "status_changed", old_value: "IN_WORK", new_value: "QC_REVIEW", note: "Передано на контроль", created_at: "2026-04-10T16:00:00Z", user_id: 4, user_name: "Мастер Цеха" },
    { id: 14, order_id: 10, action: "status_changed", old_value: "QC_REVIEW", new_value: "QC_PASSED", note: "Замечаний нет", created_at: "2026-04-11T09:45:00Z", user_id: 8, user_name: "Ермеков Даурен" },
  ],
  12: [
    { id: 15, order_id: 12, action: "created", old_value: null, new_value: "ANALYSIS", note: null, created_at: "2026-03-28T12:00:00Z", user_id: 10, user_name: "Искаков Марат" },
    { id: 16, order_id: 12, action: "status_changed", old_value: "IN_TRANSIT", new_value: "DELIVERED", note: "Доставлено клиенту", created_at: "2026-04-18T17:10:00Z", user_id: 9, user_name: "Курманов Руслан" },
  ],
};

// Payments (kept for mock-api backward compat)

export const MOCK_PAYMENTS: Record<number, Payment[]> = {
  1: P1,
  3: P3,
  4: P4,
  5: P5,
  6: P6,
  7: P7,
  8: P8,
  10: P10,
  11: P11,
  12: P12,
};

// Finance

export const MOCK_CATEGORIES: FinCategory[] = [
  { id: 1, name: "Продажа", level: 1, parent_id: null, full_path: "Продажа" },
  { id: 2, name: "Зарплата", level: 1, parent_id: null, full_path: "Зарплата" },
  { id: 3, name: "Материалы", level: 1, parent_id: null, full_path: "Материалы" },
  { id: 4, name: "Аренда", level: 1, parent_id: null, full_path: "Аренда" },
  { id: 5, name: "Логистика", level: 1, parent_id: null, full_path: "Логистика" },
  { id: 6, name: "Прочее", level: 1, parent_id: null, full_path: "Прочее" },
  // L2 — Продажа
  { id: 11, name: "Розница", level: 2, parent_id: 1, full_path: "Продажа / Розница" },
  { id: 12, name: "Оптовые поставки", level: 2, parent_id: 1, full_path: "Продажа / Оптовые поставки" },
  { id: 13, name: "B2B контракты", level: 2, parent_id: 1, full_path: "Продажа / B2B контракты" },
  // L2 — Зарплата
  { id: 21, name: "Производство", level: 2, parent_id: 2, full_path: "Зарплата / Производство" },
  { id: 22, name: "Менеджеры", level: 2, parent_id: 2, full_path: "Зарплата / Менеджеры" },
  { id: 23, name: "Администрация", level: 2, parent_id: 2, full_path: "Зарплата / Администрация" },
  // L2 — Материалы
  { id: 31, name: "Сэндвич-панели", level: 2, parent_id: 3, full_path: "Материалы / Сэндвич-панели" },
  { id: 32, name: "Компрессоры", level: 2, parent_id: 3, full_path: "Материалы / Компрессоры" },
  { id: 33, name: "Двери и фурнитура", level: 2, parent_id: 3, full_path: "Материалы / Двери и фурнитура" },
  // L2 — Аренда
  { id: 41, name: "Склад", level: 2, parent_id: 4, full_path: "Аренда / Склад" },
  { id: 42, name: "Офис", level: 2, parent_id: 4, full_path: "Аренда / Офис" },
  // L2 — Логистика
  { id: 51, name: "Доставка по городу", level: 2, parent_id: 5, full_path: "Логистика / Доставка по городу" },
  { id: 52, name: "Межгород", level: 2, parent_id: 5, full_path: "Логистика / Межгород" },
  // L2 — Прочее
  { id: 61, name: "Канцтовары", level: 2, parent_id: 6, full_path: "Прочее / Канцтовары" },
  { id: 62, name: "Связь", level: 2, parent_id: 6, full_path: "Прочее / Связь" },
];

export const MOCK_ACCOUNTS: BankAccount[] = [
  { id: 1, name: "Kaspi Business", balance: 4850000 },
  { id: 2, name: "Halyk Bank", balance: 2320000 },
  { id: 3, name: "Касса", balance: 480000 },
];

export const MOCK_TRANSACTIONS: FinTransaction[] = [
  { id: 1, date: "2026-03-28", transaction_type: "income", amount: 500000, currency: "KZT", account_id: 1, comment: "Оплата по заказу", category_l1_id: 1, category_l2_id: 11, category_l3_id: null, category_l4_id: null, category_l1_name: "Продажа", category_l2_name: "Розница", initiator_id: 3, initiator_name: "Серикова Айгуль", order_id: 7, order_number: "MZ-000007", counterparty_name: "Оспанов Даурен", created_at: "2026-03-28T10:00:00Z" },
  { id: 2, date: "2026-03-27", transaction_type: "expense", amount: 1200000, currency: "KZT", account_id: 2, comment: "Закупка сэндвич-панелей", category_l1_id: 3, category_l2_id: 31, category_l3_id: null, category_l4_id: null, category_l1_name: "Материалы", category_l2_name: "Сэндвич-панели", initiator_id: 1, initiator_name: "Админ Тестов", order_id: null, order_number: null, counterparty_name: "ТОО СтройПанель", created_at: "2026-03-27T14:00:00Z" },
  { id: 3, date: "2026-03-26", transaction_type: "expense", amount: 350000, currency: "KZT", account_id: 2, comment: "Зарплата за март (аванс)", category_l1_id: 2, category_l2_id: 22, category_l3_id: null, category_l4_id: null, category_l1_name: "Зарплата", category_l2_name: "Менеджеры", initiator_id: 1, initiator_name: "Админ Тестов", order_id: null, order_number: null, counterparty_name: "ФОТ март 2026", created_at: "2026-03-26T09:00:00Z" },
  { id: 4, date: "2026-03-25", transaction_type: "income", amount: 400000, currency: "KZT", account_id: 2, comment: "Оплата по заказу", category_l1_id: 1, category_l2_id: 11, category_l3_id: null, category_l4_id: null, category_l1_name: "Продажа", category_l2_name: "Розница", initiator_id: 5, initiator_name: "Жумабеков Асхат", order_id: 3, order_number: "MZ-000003", counterparty_name: "Нурланова Дана", created_at: "2026-03-25T15:00:00Z" },
  { id: 5, date: "2026-03-24", transaction_type: "expense", amount: 150000, currency: "KZT", account_id: 1, comment: "Аренда склада март", category_l1_id: 4, category_l2_id: 41, category_l3_id: null, category_l4_id: null, category_l1_name: "Аренда", category_l2_name: "Склад", initiator_id: 1, initiator_name: "Админ Тестов", order_id: null, order_number: null, counterparty_name: "ТОО АрендаПлюс", created_at: "2026-03-24T11:00:00Z" },
  { id: 6, date: "2026-03-22", transaction_type: "expense", amount: 85000, currency: "KZT", account_id: 3, comment: "Доставка заказа в Актобе", category_l1_id: 5, category_l2_id: 52, category_l3_id: null, category_l4_id: null, category_l1_name: "Логистика", category_l2_name: "Межгород", initiator_id: 1, initiator_name: "Админ Тестов", order_id: 7, order_number: "MZ-000007", counterparty_name: "ТК Энергия", created_at: "2026-03-22T16:00:00Z" },
  { id: 7, date: "2026-03-20", transaction_type: "income", amount: 260000, currency: "KZT", account_id: 3, comment: "Доплата наличными", category_l1_id: 1, category_l2_id: 11, category_l3_id: null, category_l4_id: null, category_l1_name: "Продажа", category_l2_name: "Розница", initiator_id: 5, initiator_name: "Жумабеков Асхат", order_id: 4, order_number: "MZ-000004", counterparty_name: "Бакытов Тимур", created_at: "2026-03-20T13:00:00Z" },
  { id: 8, date: "2026-03-18", transaction_type: "expense", amount: 45000, currency: "KZT", account_id: 1, comment: "Канцтовары, хозтовары", category_l1_id: 6, category_l2_id: 61, category_l3_id: null, category_l4_id: null, category_l1_name: "Прочее", category_l2_name: "Канцтовары", initiator_id: 1, initiator_name: "Админ Тестов", order_id: null, order_number: null, counterparty_name: "Офис Маркет", created_at: "2026-03-18T10:30:00Z" },
  { id: 9, date: "2026-03-15", transaction_type: "income", amount: 500000, currency: "KZT", account_id: 1, comment: "Оплата по заказу", category_l1_id: 1, category_l2_id: 13, category_l3_id: null, category_l4_id: null, category_l1_name: "Продажа", category_l2_name: "B2B контракты", initiator_id: 3, initiator_name: "Серикова Айгуль", order_id: 5, order_number: "MZ-000005", counterparty_name: "Сулейменов Марат", created_at: "2026-03-15T12:00:00Z" },
  { id: 10, date: "2026-03-10", transaction_type: "expense", amount: 780000, currency: "KZT", account_id: 2, comment: "Компрессоры для агрегатов", category_l1_id: 3, category_l2_id: 32, category_l3_id: null, category_l4_id: null, category_l1_name: "Материалы", category_l2_name: "Компрессоры", initiator_id: 1, initiator_name: "Админ Тестов", order_id: null, order_number: null, counterparty_name: "ТОО ХолодТехника", created_at: "2026-03-10T09:00:00Z" },
];

export const MOCK_REPORT_SUMMARY: ReportSummary = {
  income: 1660000,
  expense: 2610000,
  balance: -950000,
};

export const MOCK_CATEGORY_BREAKDOWN_EXPENSE: CategoryBreakdown[] = [
  { category_id: 3, category_name: "Материалы", total: 1980000, subcategories: [] },
  { category_id: 2, category_name: "Зарплата", total: 350000, subcategories: [] },
  { category_id: 4, category_name: "Аренда", total: 150000, subcategories: [] },
  { category_id: 5, category_name: "Логистика", total: 85000, subcategories: [] },
  { category_id: 6, category_name: "Прочее", total: 45000, subcategories: [] },
];

export const MOCK_CATEGORY_BREAKDOWN_INCOME: CategoryBreakdown[] = [
  { category_id: 1, category_name: "Продажа", total: 1660000, subcategories: [] },
];
