import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateOrder, useSalesChannels, useManufacturers } from "@/hooks/useOrders";
import { useProducts, usePrices } from "@/hooks/useProducts";
import { useAuthStore } from "@/stores/auth-store";
import { formatMoney } from "@/lib/order-helpers";
import { rawPhone } from "@/lib/phone-mask";
import type { OrderItemCreate, Price } from "@/types";

import type {
  DraftItem,
  ClientData,
  IndividualClient,
  LegalClient,
} from "./types";

import { ClientBlock } from "./_components/ClientBlock";
import { ItemsBlock } from "./_components/ItemsBlock";
import { SummaryBlock } from "./_components/SummaryBlock";
import { ContractBlock } from "./_components/ContractBlock";
import { ProductPicker } from "./_components/ProductPicker";
import { IconChevronLeft } from "./_components/Icons";

const INITIAL_INDIVIDUAL: IndividualClient = {
  type: "individual",
  name: "",
  iin: "",
  phone: "+7",
  region: "",
  district: "",
  address: "",
};

const INITIAL_LEGAL: LegalClient = {
  type: "legal",
  companyName: "",
  bin: "",
  director: "",
  phone: "+7",
  iik: "",
  bik: "",
  bankName: "",
  legalAddress: "",
  region: "",
  district: "",
  address: "",
};

export function CreateOrderPage() {
  const navigate = useNavigate();
  const createOrder = useCreateOrder();

  const role = useAuthStore((s) => s.role);
  const userId = useAuthStore((s) => s.userId);
  const organizationId = useAuthStore((s) => s.organizationId);
  const upperRole = role?.toUpperCase() ?? "";
  const canSeeDealerPrice =
    upperRole === "SUPER_ADMIN" || upperRole === "DEALER_ADMIN";

  const { data: products } = useProducts({ is_active: true });
  const { data: prices } = usePrices();
  const { data: salesChannelsList = [] } = useSalesChannels();
  const { data: manufacturersList = [] } = useManufacturers();

  const priceMap = new Map<number, Price>();
  prices?.forEach((p) => priceMap.set(p.product_id, p));

  // ── CLIENT STATE ──
  const [client, setClient] = useState<ClientData>(INITIAL_INDIVIDUAL);

  function handleClientChange(
    patch: Partial<IndividualClient> | Partial<LegalClient>,
  ) {
    setClient((prev) => ({ ...prev, ...patch }) as ClientData);
  }

  function handleClientTypeChange(type: "individual" | "legal") {
    const phone =
      client.type === "individual"
        ? (client as IndividualClient).phone
        : (client as LegalClient).phone;

    setClient(
      type === "individual"
        ? { ...INITIAL_INDIVIDUAL, phone }
        : { ...INITIAL_LEGAL, phone },
    );
  }

  const buyerName =
    client.type === "individual"
      ? (client as IndividualClient).name
      : (client as LegalClient).companyName;

  const buyerIIN =
    client.type === "individual"
      ? (client as IndividualClient).iin
      : (client as LegalClient).bin;

  const buyerPhone =
    client.type === "individual"
      ? (client as IndividualClient).phone
      : (client as LegalClient).phone;

  const buyerRegion = client.region;
  const buyerDistrict = client.district;
  const buyerAddress = client.address;

  // ── CONTRACT ──
  const [hasContract, setHasContract] = useState(false);
  const [contractNumber, setContractNumber] = useState("");
  const [contractDate, setContractDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [contractGenerating] = useState(false);
  const [contractError] = useState(false);

  // ── ORDER DETAILS ──
  const [salesChannel, setSalesChannel] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  // ── ORDER ──
  const [deadline, setDeadline] = useState("");
  const [items, setItems] = useState<DraftItem[]>([]);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");

  // Buyer auto-creation modal
  const [buyerCredentials, setBuyerCredentials] = useState<{
    phone: string;
    tempPassword: string;
    orderId: number;
  } | null>(null);

  const totalAmount = items.reduce((s, i) => s + i.total_price, 0);

  function addProducts(productIds: number[]) {
    setItems((prev) => {
      const newItems = productIds
        .map((id) => {
          const product = products?.find((p) => p.id === id);
          if (!product) return null;

          const price = priceMap.get(id);
          const recPrice =
            price?.recommended_price ?? price?.price_per_meter ?? 0;

          const colors = product.available_colors
            ? product.available_colors
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean)
            : [];

          return {
            id: `${id}-${Date.now()}-${Math.random()}`,
            product_id: product.id,
            model: product.model,
            category: product.category,
            quantity: 1,
            unit: product.unit,
            color: colors[0] ?? "",
            available_colors: colors,
            recommended_price: recPrice,
            discount_percent: 0,
            discount_amount: 0,
            price_per_unit: recPrice,
            base_price: recPrice,
            total_price: recPrice,
          };
        })
        .filter(Boolean) as DraftItem[];

      return [...prev, ...newItems];
    });

    setShowProductPicker(false);
    setPickerSearch("");
  }

  function updateItem(index: number, patch: Partial<DraftItem>) {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        const updated = { ...item, ...patch };

        if ("discount_percent" in patch) {
          updated.discount_percent = Math.max(
            0,
            Math.min(100, Number(patch.discount_percent) || 0),
          );
        }

        if ("price_per_unit" in patch) {
          const newPrice = Number(patch.price_per_unit) || 0;
          updated.price_per_unit = newPrice;
          updated.base_price = newPrice;
          updated.discount_percent = 0;
        }

        if ("quantity" in patch) {
          updated.quantity = Math.max(1, Number(patch.quantity) || 1);
        }

        const priceWithDiscount =
          updated.price_per_unit * (1 - (updated.discount_percent || 0) / 100);

        updated.total_price = updated.quantity * priceWithDiscount;
        updated.discount_amount =
          updated.quantity * updated.price_per_unit - updated.total_price;

        return updated;
      }),
    );
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!items.length) return;

    const orderItems: OrderItemCreate[] = items.map((i) => ({
      product_id: i.product_id,
      model: i.model,
      category: i.category,
      quantity: i.quantity,
      unit: i.unit,
      length: i.length ?? null,
      height: i.height ?? null,
      width: i.width ?? null,
      color: i.color || "",
      recommended_price: i.recommended_price,
      price_per_unit: i.price_per_unit,
      discount_percent: i.discount_percent,
      discount_amount: i.discount_percent ? 0 : i.discount_amount,
      total_price: i.total_price,
    }));

    const regionStr = buyerDistrict
      ? `${buyerRegion}, ${buyerDistrict}`
      : buyerRegion;

    createOrder.mutate(
      {
        organization_id: organizationId ?? undefined,
        manager_id: userId ?? undefined,
        order_date: new Date().toISOString().split("T")[0],
        client_name: buyerName,
        client_phone: rawPhone(buyerPhone).replace(/\D/g, ""),
        client_region: regionStr,
        client_address: buyerAddress,
        delivery_address: deliveryAddress || undefined,

        client_iin:
          client.type === "individual"
            ? (client as IndividualClient).iin
            : undefined,

        client_type: client.type,

        ...(client.type === "legal"
          ? {
              company_director: (client as LegalClient).director,
              company_bin: (client as LegalClient).bin,
              company_iik: (client as LegalClient).iik || undefined,
              company_bik: (client as LegalClient).bik || undefined,
              company_bank_name: (client as LegalClient).bankName || undefined,
              company_legal_address:
                (client as LegalClient).legalAddress || undefined,
            }
          : {}),

        has_contract: hasContract,
        contract_number: contractNumber || undefined,
        sales_channel: salesChannel || undefined,
        manufacturer: manufacturer || undefined,
        payment_type: paymentType || undefined,
        deadline: deadline || null,
        items: orderItems,
      },
      {
        onSuccess: async (order) => {
          // Договор больше не генерируется автоматически. Менеджер открывает
          // карточку заказа и проходит проверку данных перед генерацией.
          // hasContract здесь служит только подсказкой («да, договор нужен»),
          // фактическая генерация делается через verify-флоу.

          if (order.buyer_temp_password) {
            setBuyerCredentials({
              phone: order.client_phone,
              tempPassword: order.buyer_temp_password,
              orderId: order.id,
            });
          } else {
            navigate(
              `/orders/${order.id}`,
              { replace: true, state: hasContract ? { autoOpenVerify: true } : undefined },
            );
          }
        },
      },
    );
  }

  // ── Проверка данных для договора ──
  const contractIssues: string[] = [];
  if (hasContract) {
    if (!buyerName.trim()) {
      contractIssues.push(client.type === "individual" ? "ФИО клиента" : "Название компании");
    }
    const iinDigits = (buyerIIN || "").replace(/\D/g, "");
    if (iinDigits.length !== 12) {
      contractIssues.push(client.type === "individual" ? "ИИН (12 цифр)" : "БИН (12 цифр)");
    }
    const phoneDigits = (buyerPhone || "").replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 12) {
      contractIssues.push("Телефон клиента (для SMS-подписания)");
    }
    if (!deliveryAddress.trim() && !buyerAddress.trim()) {
      contractIssues.push("Адрес доставки");
    }
    if (client.type === "legal" && !(client as LegalClient).director.trim()) {
      contractIssues.push("Директор компании");
    }
  }

  const isSubmitDisabled =
    !items.length ||
    createOrder.isPending ||
    contractGenerating ||
    (hasContract && contractIssues.length > 0);

  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg-base)" }}>
      <div className="mobile-header">
        <button
          type="button"
          className="btn btn-ghost btn-icon-sm"
          onClick={() => navigate(-1)}
        >
          <IconChevronLeft />
        </button>
        <h1 className="page-title" style={{ flex: 1 }}>
          Новый заказ
        </h1>
        {items.length > 0 && (
          <span className="text-sm font-semibold text-brand tabnum">
            {formatMoney(totalAmount)}
          </span>
        )}
      </div>

      <form
        id="create-order-form"
        onSubmit={handleSubmit}
        className="stack fade-up"
        style={{ padding: "12px 16px", paddingBottom: 24, gap: 10 }}
      >
        <ClientBlock
          client={client}
          onChange={handleClientChange}
          onChangeType={handleClientTypeChange}
        />

        {/* ── Детали заказа ── */}
        <div className="card">
          <p className="card-title" style={{ marginBottom: 10 }}>
            Детали заказа
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div className="form-group">
              <label className="form-label">Канал продаж</label>
              <select
                className="input"
                value={salesChannel}
                onChange={(e) => setSalesChannel(e.target.value)}
              >
                <option value="">Не выбран</option>
                {salesChannelsList.map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Производитель</label>
              <select
                className="input"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
              >
                <option value="">Не выбран</option>
                {manufacturersList.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Тип оплаты</label>
              <select
                className="input"
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
              >
                <option value="">Не выбран</option>
                <option value="cash">Наличные</option>
                <option value="card">Карта</option>
                <option value="transfer">Перевод</option>
                <option value="credit">Рассрочка / кредит</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Адрес доставки</label>
              <input
                className="input"
                placeholder="Улица, дом — если отличается от адреса клиента"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
              />
            </div>
          </div>
        </div>

        <ItemsBlock
          items={items}
          onUpdate={updateItem}
          onRemove={removeItem}
          onOpenPicker={() => setShowProductPicker(true)}
        />

        {items.length > 0 && (
          <>
            <SummaryBlock
              totalAmount={totalAmount}
              deadline={deadline}
              setDeadline={setDeadline}
            />

            <ContractBlock
              hasContract={hasContract}
              setHasContract={setHasContract}
              contractNumber={contractNumber}
              setContractNumber={setContractNumber}
              contractDate={contractDate}
              setContractDate={setContractDate}
              contractGenerating={contractGenerating}
              contractError={contractError}
              clientType={client.type}
              buyerName={buyerName}
              buyerIIN={buyerIIN}
              buyerAddress={buyerAddress}
              totalAmount={totalAmount}
            />

            {hasContract && (
              <div
                className="card"
                style={{
                  background: contractIssues.length
                    ? "rgba(220,38,38,0.05)"
                    : "rgba(34,197,94,0.06)",
                  border: `1px solid ${
                    contractIssues.length ? "rgba(220,38,38,0.25)" : "rgba(34,197,94,0.3)"
                  }`,
                }}
              >
                <div className="row-between" style={{ alignItems: "center" }}>
                  <p className="text-sm font-semibold text-default" style={{ margin: 0 }}>
                    Проверка данных договора
                  </p>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    padding: "2px 9px", borderRadius: 999,
                    background: contractIssues.length ? "#fee2e2" : "#dcfce7",
                    color: contractIssues.length ? "#b91c1c" : "#15803d",
                  }}>
                    {contractIssues.length ? `Не хватает: ${contractIssues.length}` : "Готово"}
                  </span>
                </div>
                {contractIssues.length > 0 ? (
                  <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 13, color: "#b91c1c" }}>
                    {contractIssues.map((issue) => (
                      <li key={issue} style={{ margin: "2px 0" }}>{issue}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-secondary" style={{ margin: "8px 0 0" }}>
                    Все ключевые поля заполнены. После создания заказа откроется
                    карточка с финальной проверкой и кнопкой «Сгенерировать».
                  </p>
                )}
              </div>
            )}
          </>
        )}

        <button
          type="submit"
          form="create-order-form"
          className="btn btn-primary btn-xl"
          style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
          disabled={isSubmitDisabled}
        >
          {contractGenerating
            ? "Генерируем договор..."
            : createOrder.isPending
              ? "Создание..."
              : items.length === 0
                ? "Добавьте товары"
                : hasContract && contractIssues.length > 0
                  ? `Заполните данные договора (${contractIssues.length})`
                  : `Создать заказ · ${formatMoney(totalAmount)}`}
        </button>
      </form>

      {showProductPicker && (
        <ProductPicker
          products={products}
          priceMap={priceMap}
          canSeeDealerPrice={canSeeDealerPrice}
          search={pickerSearch}
          setSearch={setPickerSearch}
          onSelectMultiple={addProducts}
          onClose={() => {
            setShowProductPicker(false);
            setPickerSearch("");
          }}
        />
      )}

      {buyerCredentials && (
        <BuyerCredentialsModal
          phone={buyerCredentials.phone}
          tempPassword={buyerCredentials.tempPassword}
          onClose={() => {
            navigate(`/orders/${buyerCredentials.orderId}`, { replace: true });
          }}
        />
      )}
    </div>
  );
}

/* ── Modal: auto-created buyer credentials ── */

function BuyerCredentialsModal({
  phone,
  tempPassword,
  onClose,
}: {
  phone: string;
  tempPassword: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const text = `Телефон: ${phone}\nВременный пароль: ${tempPassword}`;

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 999,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-surface)",
          borderRadius: "var(--radius-lg)",
          width: "100%", maxWidth: 400,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          padding: "20px 16px",
          display: "flex", flexDirection: "column", gap: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "var(--green-light, #e6f9ee)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="var(--green, #22c55e)" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 8v6m3-3h-6" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold text-default">Покупатель создан автоматически</div>
            <div className="text-xs text-muted">Передайте данные покупателю для входа</div>
          </div>
        </div>

        <div style={{
          background: "var(--bg-base)",
          borderRadius: "var(--radius-md, 8px)",
          padding: "12px 14px",
          display: "flex", flexDirection: "column", gap: 8,
        }}>
          <div>
            <div className="text-xs text-muted" style={{ marginBottom: 2 }}>Телефон</div>
            <div className="text-sm font-semibold text-default tabnum">{phone}</div>
          </div>
          <div>
            <div className="text-xs text-muted" style={{ marginBottom: 2 }}>Временный пароль</div>
            <div className="text-sm font-bold tabnum" style={{ color: "var(--brand)", letterSpacing: "0.05em" }}>
              {tempPassword}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ flex: 1, justifyContent: "center" }}
            onClick={handleCopy}
          >
            {copied ? "Скопировано!" : "Скопировать"}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ flex: 1, justifyContent: "center" }}
            onClick={onClose}
          >
            Перейти к заказу
          </button>
        </div>
      </div>
    </div>
  );
}
