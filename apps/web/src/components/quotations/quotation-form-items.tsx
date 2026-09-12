"use client";

import {
  useEffect,
  useRef,
} from "react";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import {
  CSS,
} from "@dnd-kit/utilities";

import {
  Plus,
  GripVertical,
} from "lucide-react";

import {
  QuotationFormItemRow,
} from "@/components/quotations/quotation-form-item-row";

import type {
  QuotationFormItem,
} from "@/types/quotation-form";

type QuotationFormItemsProps = {
  items: QuotationFormItem[];

  onAdd: () => void;

  onInsertBefore: (key: string) => void;
  onInsertAfter: (key: string) => void;

  onRemove: (
    key: string,
  ) => void;

  onReorder: (
    items: QuotationFormItem[],
  ) => void;

  onChange: (
    key: string,
    patch: Partial<QuotationFormItem>,
  ) => void;

  onImageSelect: (
    key: string,
    file: File,
  ) => void | Promise<void>;

  uploadingImageKey?: string | null;

  currency: string;
};

type SortableQuotationFormItemProps = {
  item: QuotationFormItem;

  canRemove: boolean;

  onChange: (
    patch: Partial<QuotationFormItem>,
  ) => void;

  onRemove: () => void;
  onInsertBefore: () => void;
  onInsertAfter: () => void;

  onImageSelect: (
    file: File,
  ) => void | Promise<void>;

  isUploadingImage: boolean;

  currency: string;

  isLast: boolean;

  lastItemRef:
    | React.RefObject<HTMLDivElement | null>
    | undefined;
};

function SortableQuotationFormItem({
  item,
  canRemove,
  onChange,
  onRemove,
  onInsertBefore,
  onInsertAfter,
  onImageSelect,
  isUploadingImage,
  currency,
  isLast,
  lastItemRef,
}: SortableQuotationFormItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.key,
  });

  const style = {
    transform:
      CSS.Transform.toString(
        transform,
      ),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={
        isDragging
          ? "relative z-50 opacity-60"
          : "relative"
      }
    >
      {/* Drag handle */}
      <div className="mb-2 flex items-center">
        <button
          type="button"
          {...listeners}
          className="
            inline-flex
            cursor-grab
            touch-none
            items-center
            justify-center
            rounded-lg
            p-1.5
            text-slate-700
            transition

            hover:bg-white/[0.04]
            hover:text-slate-400

            active:cursor-grabbing
          "
          title="Drag to reorder"
          aria-label="Drag to reorder quotation item"
        >
          <GripVertical
            size={17}
            strokeWidth={2}
          />
        </button>

        <span className="text-[11px] text-slate-700">
          Drag to reorder
        </span>
      </div>

      <div
        ref={
          isLast
            ? lastItemRef
            : undefined
        }
      >
        <QuotationFormItemRow
          item={item}
          canRemove={canRemove}
          onChange={onChange}
          onRemove={onRemove}
          onInsertBefore={onInsertBefore}
          onInsertAfter={onInsertAfter}
          onImageSelect={
            onImageSelect
          }
          isUploadingImage={
            isUploadingImage
          }
          currency={currency}
        />
      </div>
    </div>
  );
}

export function QuotationFormItems({
  items,
  onAdd,
  onInsertBefore,
  onInsertAfter,
  onRemove,
  onReorder,
  onChange,
  onImageSelect,
  uploadingImageKey,
  currency,
}: QuotationFormItemsProps) {

  const lastItemRef = useRef<HTMLDivElement | null>(null);
  const previousItemCount = useRef(items.length);
  const shouldScrollToLastItem = useRef(false);

  const sensors = useSensors(
    useSensor(
      PointerSensor,
      {
        activationConstraint: {
          distance: 6,
        },
      },
    ),
  );

  useEffect(() => {
    const itemAdded =
      items.length > previousItemCount.current;

    previousItemCount.current = items.length;

    if (
      !itemAdded ||
      !shouldScrollToLastItem.current
    ) {
      return;
    }

    shouldScrollToLastItem.current = false;

    requestAnimationFrame(() => {
      lastItemRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }, [items.length]);

  function handleDragEnd(
    event: DragEndEvent,
  ) {
    const {
      active,
      over,
    } = event;

    if (!over) {
      return;
    }

    if (
      active.id ===
      over.id
    ) {
      return;
    }

    const oldIndex =
      items.findIndex(
        (item) =>
          item.key ===
          active.id,
      );

    const newIndex =
      items.findIndex(
        (item) =>
          item.key ===
          over.id,
      );

    if (
      oldIndex === -1 ||
      newIndex === -1
    ) {
      return;
    }

    const reorderedItems =
      arrayMove(
        items,
        oldIndex,
        newIndex,
      );

    onReorder(
      reorderedItems,
    );
  }

  return (
    <div className="min-w-0">
      {/* Header */}
      <div className="mb-4 min-w-0">
        <h3 className="text-sm font-medium text-slate-300">
          Quotation items
        </h3>

        <p className="mt-1 text-xs leading-5 text-slate-600">
          Add products or services included in the quotation.
        </p>
      </div>

      {/* Items */}
      <DndContext
        sensors={sensors}
        collisionDetection={
          closestCenter
        }
        onDragEnd={
          handleDragEnd
        }
      >
        <SortableContext
          items={items.map(
            (item) =>
              item.key,
          )}
          strategy={
            verticalListSortingStrategy
          }
        >
          <div className="min-w-0 space-y-3">
            {items.map(
              (
                item,
                index,
              ) => {
                const isLast =
                  index ===
                  items.length -
                    1;

                return (
                  <SortableQuotationFormItem
                    key={
                      item.key
                    }
                    item={
                      item
                    }
                    canRemove={
                      items.length >
                      1
                    }
                    onChange={(
                      patch,
                    ) =>
                      onChange(
                        item.key,
                        patch,
                      )
                    }
                    onRemove={() =>
                      onRemove(
                        item.key,
                      )
                    }
                    onInsertBefore={() =>
                      onInsertBefore(item.key)
                    }
                    onInsertAfter={() =>
                      onInsertAfter(item.key)
                    }
                    onImageSelect={(
                      file,
                    ) =>
                      onImageSelect(
                        item.key,
                        file,
                      )
                    }
                    isUploadingImage={
                      uploadingImageKey ===
                      item.key
                    }
                    currency={
                      currency
                    }
                    isLast={
                      isLast
                    }
                    lastItemRef={
                      isLast
                        ? lastItemRef
                        : undefined
                    }
                  />
                );
              },
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add another item */}
      <button
        type="button"
        onClick={() => {
          shouldScrollToLastItem.current = true;
          onAdd();
        }}
        className="
          cursor-pointer
          mt-3
          flex
          w-full
          items-center
          justify-center
          gap-2
          rounded-xl
          border
          border-emerald-400/30
          bg-emerald-400/[0.07]
          px-4
          py-3
          text-xs
          font-medium
          text-emerald-300
          shadow-[0_0_0_1px_rgba(52,211,153,0.03)]
          transition-all
          duration-200

          hover:border-emerald-400/50
          hover:bg-emerald-400/[0.12]
          hover:text-emerald-200
          hover:shadow-[0_0_22px_rgba(52,211,153,0.08)]

          active:scale-[0.995]
        "
      >
        <Plus
          size={15}
          strokeWidth={2}
        />

        Add another item
      </button>
    </div>
  );
}