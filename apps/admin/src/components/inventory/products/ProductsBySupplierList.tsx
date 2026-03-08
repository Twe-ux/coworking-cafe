"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/types/inventory";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronRight, GripVertical } from "lucide-react";
import { useState } from "react";
import { ProductCard } from "./ProductCard";

interface SupplierGroup {
  supplierName: string;
  supplierId: string;
  products: Product[];
}

interface ProductsBySupplierListProps {
  groups: SupplierGroup[];
  loading: boolean;
  onEdit: (product: Product) => void;
  onDeactivate: (product: Product) => void;
  onReactivate: (id: string) => Promise<boolean>;
  onReorder?: (reorderedGroups: SupplierGroup[]) => void;
}

// Internal sortable card for drag&drop mode
function SortableSupplierCard({
  group,
  isOpen,
  onToggle,
  children,
}: {
  group: SupplierGroup;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: group.supplierId });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={isDragging ? "opacity-50 shadow-lg z-50" : ""}
    >
      <div className="flex items-center gap-2 p-3 transition-colors">
        <button
          className="cursor-grab active:cursor-grabbing touch-none p-1 hover:bg-muted rounded"
          onClick={(e) => e.stopPropagation()}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>
        <div
          className="flex items-center gap-2 flex-1 cursor-pointer"
          onClick={onToggle}
        >
          {isOpen ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          <span className="font-semibold">{group.supplierName}</span>
          <Badge variant="outline" className="text-xs font-normal">
            {group.products.length} produit
            {group.products.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </div>
      {isOpen && children}
    </Card>
  );
}

export function ProductsBySupplierList({
  groups,
  loading,
  onEdit,
  onDeactivate,
  onReactivate,
  onReorder,
}: ProductsBySupplierListProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !onReorder) return;
    const oldIdx = groups.findIndex((g) => g.supplierId === active.id);
    const newIdx = groups.findIndex((g) => g.supplierId === over.id);
    onReorder(arrayMove(groups, oldIdx, newIdx));
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Aucun produit trouvé
        </CardContent>
      </Card>
    );
  }

  const renderProducts = (products: Product[]) => (
    <CardContent className="border-t pt-1 pb-1 space-y-0">
      {products.map((p) => (
        <ProductCard
          key={p._id}
          product={p}
          onEdit={onEdit}
          onDeactivate={onDeactivate}
          onReactivate={onReactivate}
        />
      ))}
    </CardContent>
  );

  // Drag&drop mode
  if (onReorder) {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={groups.map((g) => g.supplierId)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3 ">
            {groups.map((group) => (
              <SortableSupplierCard
                key={group.supplierId}
                group={group}
                isOpen={expanded.has(group.supplierId)}
                onToggle={() => toggle(group.supplierId)}
              >
                {renderProducts(group.products)}
              </SortableSupplierCard>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    );
  }

  // Standard mode (no drag)
  return (
    <div className="space-y-3">
      {groups.map(({ supplierName, supplierId, products }) => {
        const isOpen = expanded.has(supplierId);
        return (
          <Card key={supplierId}>
            <div
              className="flex items-center gap-3 p-3 hover:bg-green-50 transition-colors cursor-pointer"
              onClick={() => toggle(supplierId)}
            >
              {isOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              <span className="font-semibold">{supplierName}</span>
              <Badge variant="outline" className="text-xs font-normal">
                {products.length} produit{products.length !== 1 ? "s" : ""}
              </Badge>
            </div>
            {isOpen && renderProducts(products)}
          </Card>
        );
      })}
    </div>
  );
}
