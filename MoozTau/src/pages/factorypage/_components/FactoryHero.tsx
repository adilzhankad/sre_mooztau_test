import { Button } from "@/components/ui/Button";
import { FactoryGlyph, InventoryGlyph, OrdersGlyph } from "./FactoryIcons";

interface Props {
  totalOrders: number;
  totalInventoryUnits: number;
  canManageInventory: boolean;
  onOpenInventory: () => void;
}

export function FactoryHero({
  totalOrders,
  totalInventoryUnits,
  canManageInventory,
  onOpenInventory,
}: Props) {
  return (
    <section className="factory-hero">
      <div className="factory-hero__content">
        <div className="factory-hero__eyebrow">
          <FactoryGlyph />
          <span>Производственный контур</span>
        </div>
        <h1 className="factory-hero__title">Фабрика и склад в одном рабочем контуре</h1>
        <p className="factory-hero__text">
          Здесь видно текущую нагрузку по заказам, очередь на QC и оперативное состояние складских позиций.
          Для суперадмина открыт полный CRUD по складу прямо на странице.
        </p>
      </div>

      <div className="factory-hero__aside">
        <div className="factory-hero__metric">
          <span className="factory-hero__metric-icon">
            <OrdersGlyph />
          </span>
          <div>
            <p className="factory-hero__metric-value">{totalOrders}</p>
            <p className="factory-hero__metric-label">активных заказов</p>
          </div>
        </div>

        <div className="factory-hero__metric">
          <span className="factory-hero__metric-icon">
            <InventoryGlyph />
          </span>
          <div>
            <p className="factory-hero__metric-value">{totalInventoryUnits}</p>
            <p className="factory-hero__metric-label">единиц на складе</p>
          </div>
        </div>

        <Button size="md" onClick={onOpenInventory}>
          {canManageInventory ? "Открыть склад и управление" : "Открыть склад"}
        </Button>
      </div>
    </section>
  );
}
