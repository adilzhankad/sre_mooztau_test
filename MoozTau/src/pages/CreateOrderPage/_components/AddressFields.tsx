import { REGION_NAMES } from "../constants";

interface AddressFieldsProps {
  isLegal?: boolean;
  region: string;
  setRegion: (v: string) => void;
  district: string;
  setDistrict: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  districts: string[];
}

export function AddressFields({
  isLegal = false,
  region,
  setRegion,
  district,
  setDistrict,
  address,
  setAddress,
  districts,
}: AddressFieldsProps) {
  return (
    <>
      <div className="form-group">
        <label className="form-label">Регион</label>
        <select
          className="input"
          required
          value={region}
          onChange={(e) => {
            setRegion(e.target.value);
            setDistrict("");
          }}
        >
          <option value="" disabled>
            Выберите регион
          </option>
          {REGION_NAMES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {districts.length > 0 && (
        <div className="form-group">
          <label className="form-label">Район</label>
          <select
            className="input"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          >
            <option value="">Без уточнения</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="form-group">
        <label className="form-label">
          {isLegal ? "Юридический адрес / адрес доставки" : "Адрес доставки"}
        </label>
        <input
          className="input"
          required
          placeholder="Улица, дом, квартира"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>
    </>
  );
}
