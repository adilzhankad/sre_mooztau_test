interface ContractBlockProps {
  hasContract: boolean;
  setHasContract: (v: boolean) => void;
  contractNumber: string;
  setContractNumber: (v: string) => void;
  contractDate: string;
  setContractDate: (v: string) => void;
  contractGenerating: boolean;
  contractError: boolean;
  clientType: "individual" | "legal";
  buyerName: string;
  buyerIIN: string;
  buyerAddress: string;
  totalAmount: number;
}

export function ContractBlock({
  hasContract,
  setHasContract,
  contractNumber,
  setContractNumber,
  contractDate,
  setContractDate,
  contractGenerating,
  contractError,
  clientType,
  buyerName,
  buyerIIN,
  buyerAddress,
  totalAmount,
}: ContractBlockProps) {
  return (
    <div className="card">
      <div className="row-between">
        <div>
          <p className="text-sm font-semibold text-default">Договор</p>
          <p className="text-xs text-secondary" style={{ marginTop: 2 }}>
            Можно создать с договором или без него
          </p>
        </div>
        <label className="toggle">
          <input
            type="checkbox"
            checked={hasContract}
            onChange={(e) => setHasContract(e.target.checked)}
          />
          <div className="toggle-track" />
        </label>
      </div>

      {hasContract && (
        <div
          className="stack"
          style={{
            marginTop: 14,
            paddingTop: 14,
            borderTop: "1px solid var(--border-light)",
            gap: 10,
          }}
        >
          {/* Preview */}
          <div
            style={{
              padding: "10px 12px",
              borderRadius: "var(--radius-md)",
              background: "var(--bg-subtle)",
              border: "1px solid var(--border-light)",
            }}
          >
            <p className="label" style={{ marginBottom: 8 }}>
              Данные для договора
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: "4px 12px",
              }}
            >
              <span className="text-xs text-muted font-semibold">
                BUYER_NAME
              </span>
              <span className="text-xs text-default font-semibold">
                {buyerName || "—"}
              </span>

              <span className="text-xs text-muted font-semibold">
                {clientType === "individual" ? "BUYER_IIN" : "BUYER_BIN"}
              </span>
              <span className="text-xs text-default font-semibold">
                {buyerIIN || "—"}
              </span>

              <span className="text-xs text-muted font-semibold">DOC_DATE</span>
              <span className="text-xs text-default font-semibold">
                {contractDate || "—"}
              </span>

              <span className="text-xs text-muted font-semibold">
                TOTAL_SUM
              </span>
              <span className="text-xs text-default font-semibold tabnum">
                {totalAmount > 0
                  ? totalAmount.toLocaleString("ru-RU") + " ₸"
                  : "—"}
              </span>

              <span className="text-xs text-muted font-semibold">
                DELIVERY_ADDRESS
              </span>
              <span className="text-xs text-default font-semibold">
                {buyerAddress || "—"}
              </span>
            </div>
          </div>

          {/* Inputs */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            <div className="form-group">
              <label className="form-label">Номер договора</label>
              <input
                className="input"
                placeholder="№ 001"
                value={contractNumber}
                onChange={(e) => setContractNumber(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Дата договора</label>
              <input
                className="input"
                type="date"
                value={contractDate}
                onChange={(e) => setContractDate(e.target.value)}
              />
            </div>
          </div>

          {/* Status */}
          {contractGenerating ? (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: "var(--radius-md)",
                background: "var(--bg-subtle)",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text-secondary)",
              }}
            >
              Генерируем договор...
            </div>
          ) : contractError ? (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: "var(--radius-md)",
                background: "#fff1f2",
                border: "1px solid #fecdd3",
                fontSize: 13,
                color: "var(--danger)",
                fontWeight: 500,
              }}
            >
              Заказ создан, но договор не сгенерировался. Можно попробовать
              позже из карточки заказа.
            </div>
          ) : (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: "var(--radius-md)",
                background: "var(--bg-subtle)",
                fontSize: 12,
                color: "var(--text-secondary)",
                fontWeight: 500,
              }}
            >
              После создания заказа откроется карточка с проверкой данных
              (телефон, ИИН, адрес и т.д.). Только после проверки менеджером
              договор будет сгенерирован.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
