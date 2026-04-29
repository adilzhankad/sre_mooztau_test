import { REGIONS_WITH_DISTRICTS } from "../constants";
import { IconPerson, IconBuilding } from "./Icons";
import { AddressFields } from "./AddressFields";
import { formatPhone } from "@/lib/phone-mask";
import type { IndividualClient, LegalClient, ClientData } from "../types";

interface ClientBlockProps {
  client: ClientData;
  onChange: (patch: Partial<IndividualClient> | Partial<LegalClient>) => void;
  onChangeType: (type: "individual" | "legal") => void;
}

export function ClientBlock({
  client,
  onChange,
  onChangeType,
}: ClientBlockProps) {
  const districts = client.region
    ? REGIONS_WITH_DISTRICTS[client.region] || []
    : [];

  return (
    <div className="card">
      <div className="row-between" style={{ marginBottom: 14 }}>
        <p className="card-title">Данные клиента</p>
        <div className="row gap-1">
          <button
            type="button"
            className={`btn btn-sm ${client.type === "individual" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => onChangeType("individual")}
            style={{ gap: 5 }}
          >
            <IconPerson /> Физ. лицо
          </button>
          <button
            type="button"
            className={`btn btn-sm ${client.type === "legal" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => onChangeType("legal")}
            style={{ gap: 5 }}
          >
            <IconBuilding /> Юр. лицо
          </button>
        </div>
      </div>

      <div className="stack" style={{ gap: 10 }}>
        {client.type === "individual" ? (
          <>
            <div className="form-group">
              <label className="form-label">ФИО клиента</label>
              <input
                className="input"
                required
                placeholder="Иванов Иван Иванович"
                value={client.name}
                onChange={(e) => onChange({ name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">ИИН</label>
              <input
                className="input"
                required
                placeholder="123456789012"
                value={client.iin}
                onChange={(e) =>
                  onChange({
                    iin: e.target.value.replace(/\D/g, "").slice(0, 12),
                  })
                }
                maxLength={12}
                inputMode="numeric"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Телефон</label>
              <input
                className="input"
                required
                type="tel"
                placeholder="+7 (700) 123-45-67"
                value={client.phone}
                onChange={(e) =>
                  onChange({ phone: formatPhone(e.target.value) })
                }
              />
            </div>
            <AddressFields
              region={client.region}
              setRegion={(v) => onChange({ region: v, district: "" })}
              district={client.district}
              setDistrict={(v) => onChange({ district: v })}
              address={client.address}
              setAddress={(v) => onChange({ address: v })}
              districts={districts}
            />
          </>
        ) : (
          <>
            <div className="form-group">
              <label className="form-label">Наименование организации</label>
              <input
                className="input"
                required
                placeholder='ТОО "Название компании"'
                value={(client as LegalClient).companyName}
                onChange={(e) => onChange({ companyName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">БИН</label>
              <input
                className="input"
                required
                placeholder="123456789012"
                value={(client as LegalClient).bin}
                onChange={(e) =>
                  onChange({
                    bin: e.target.value.replace(/\D/g, "").slice(0, 12),
                  })
                }
                maxLength={12}
                inputMode="numeric"
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                ФИО директора / представителя
              </label>
              <input
                className="input"
                placeholder="Иванов Иван Иванович"
                value={(client as LegalClient).director}
                onChange={(e) => onChange({ director: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Телефон</label>
              <input
                className="input"
                required
                type="tel"
                placeholder="+7 (700) 123-45-67"
                value={(client as LegalClient).phone}
                onChange={(e) =>
                  onChange({ phone: formatPhone(e.target.value) })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">ИИК (номер счёта)</label>
              <input
                className="input"
                placeholder="KZ00 0000 0000 0000 0000"
                value={(client as LegalClient).iik}
                onChange={(e) => onChange({ iik: e.target.value })}
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <div className="form-group">
                <label className="form-label">БИК банка</label>
                <input
                  className="input"
                  placeholder="XXXXXXXXX"
                  value={(client as LegalClient).bik}
                  onChange={(e) => onChange({ bik: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Наименование банка</label>
                <input
                  className="input"
                  placeholder='АО "Kaspi Bank"'
                  value={(client as LegalClient).bankName}
                  onChange={(e) => onChange({ bankName: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Юридический адрес</label>
              <input
                className="input"
                placeholder="г. Алматы, ул. Абая 1, офис 100"
                value={(client as LegalClient).legalAddress}
                onChange={(e) => onChange({ legalAddress: e.target.value })}
              />
            </div>
            <AddressFields
              isLegal
              region={(client as LegalClient).region}
              setRegion={(v) => onChange({ region: v, district: "" })}
              district={(client as LegalClient).district}
              setDistrict={(v) => onChange({ district: v })}
              address={(client as LegalClient).address}
              setAddress={(v) => onChange({ address: v })}
              districts={districts}
            />
          </>
        )}
      </div>
    </div>
  );
}
