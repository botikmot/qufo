import {
  Image,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import type {
  QuotationPdfData,
} from "./quotation-pdf-types";

import {
  formatPdfCurrency,
} from "@/utils/currency";

import {
  formatWarranty,
} from "@/utils/warranty";

const styles =
  StyleSheet.create({
    table: {
      marginTop: 22,

      borderWidth: 1,

      borderColor:
        "#E5E7EB",

      borderRadius: 5,
    },

    row: {
      flexDirection:
        "row",

      borderBottomWidth: 1,

      borderBottomColor:
        "#E5E7EB",

      minHeight: 34,

      alignItems:
        "center",
    },

    lastRow: {
      borderBottomWidth: 0,
    },

    headerRow: {
      backgroundColor:
        "#F8FAFC",

      minHeight: 29,
    },

    headerText: {
      fontSize: 7.5,

      fontWeight: 700,

      color: "#64748B",

      textTransform:
        "uppercase",

      letterSpacing: 0.5,
    },

    cell: {
      paddingHorizontal: 7,

      paddingVertical: 7,

      fontSize: 8.5,

      color: "#374151",
    },

    number: {
      width: "7%",

      textAlign:
        "center",
    },

    description: {
      width: "45%",
    },

    qty: {
      width: "10%",

      textAlign:
        "right",
    },

    unit: {
      width: "10%",

      textAlign:
        "center",
    },

    price: {
      width: "14%",

      textAlign:
        "right",
    },

    amount: {
      width: "14%",

      textAlign:
        "right",
    },

    itemContent: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",
    },

    itemImage: {
      width: 34,

      height: 34,

      marginRight: 7,

      borderRadius: 3,

      objectFit:
        "cover",
    },

    itemText: {
      flexGrow: 1,

      flexShrink: 1,
    },

    itemName: {
      fontSize: 8.5,

      fontWeight: 600,

      color: "#111827",

      lineHeight: 1.35,
    },

    itemDescription: {
      marginTop: 3,

      fontSize: 7.5,

      color: "#6B7280",

      lineHeight: 1.4,
    },

    warranty: {
      marginTop: 4,

      fontSize: 7.3,

      color: "#475569",

      lineHeight: 1.4,
    },

    warrantyLabel: {
      fontWeight: 700,

      color: "#334155",
    },

    warrantyTerms: {
      marginTop: 2,

      fontSize: 7,

      color: "#64748B",

      lineHeight: 1.4,
    },
  });

type Props = {
  data:
    QuotationPdfData;
};

export function QuotationPdfItems({
  data,
}: Props) {
  return (
    <View
      style={
        styles.table
      }
    >
      {/* Header */}
      <View
        style={[
          styles.row,
          styles.headerRow,
        ]}
        fixed
      >
        <Text
          style={[
            styles.cell,
            styles.headerText,
            styles.number,
          ]}
        >
          #
        </Text>

        <Text
          style={[
            styles.cell,
            styles.headerText,
            styles.description,
          ]}
        >
          Description
        </Text>

        <Text
          style={[
            styles.cell,
            styles.headerText,
            styles.qty,
          ]}
        >
          Qty
        </Text>

        <Text
          style={[
            styles.cell,
            styles.headerText,
            styles.unit,
          ]}
        >
          Unit
        </Text>

        <Text
          style={[
            styles.cell,
            styles.headerText,
            styles.price,
          ]}
        >
          Rate
        </Text>

        <Text
          style={[
            styles.cell,
            styles.headerText,
            styles.amount,
          ]}
        >
          Amount
        </Text>
      </View>

      {/* Items */}
      {data.items.map(
        (
          item,
          index,
        ) => {
          const warranty =
            formatWarranty(
              item.warrantyDuration,
              item.warrantyUnit,
            );

          return (
            <View
              key={
                item.id
              }
              style={[
                styles.row,

                index ===
                  data.items.length -
                    1
                  ? styles.lastRow
                  : {},
              ]}
              wrap={false}
            >
              {/* Number */}
              <Text
                style={[
                  styles.cell,
                  styles.number,
                ]}
              >
                {index + 1}
              </Text>

              {/* Item */}
              <View
                style={[
                  styles.cell,
                  styles.description,
                ]}
              >
                <View
                  style={
                    styles.itemContent
                  }
                >
                  {item.imageUrl && (
                    <Image
                      src={
                        item.imageUrl
                      }
                      style={
                        styles.itemImage
                      }
                    />
                  )}

                  <View
                    style={
                      styles.itemText
                    }
                  >
                    <Text
                      style={
                        styles.itemName
                      }
                    >
                      {item.name}
                    </Text>

                    {item.description?.trim() && (
                      <Text
                        style={
                          styles.itemDescription
                        }
                      >
                        {
                          item.description.trim()
                        }
                      </Text>
                    )}

                    {warranty && (
                      <Text
                        style={
                          styles.warranty
                        }
                      >
                        <Text
                          style={
                            styles.warrantyLabel
                          }
                        >
                          Warranty:{" "}
                        </Text>

                        {warranty}
                      </Text>
                    )}

                    {warranty &&
                      item.warrantyTerms?.trim() && (
                        <Text
                          style={
                            styles.warrantyTerms
                          }
                        >
                          {
                            item.warrantyTerms.trim()
                          }
                        </Text>
                      )}
                  </View>
                </View>
              </View>

              {/* Quantity */}
              <Text
                style={[
                  styles.cell,
                  styles.qty,
                ]}
              >
                {item.quantity}
              </Text>

              {/* Unit */}
              <Text
                style={[
                  styles.cell,
                  styles.unit,
                ]}
              >
                {item.unit || "-"}
              </Text>

              {/* Unit price */}
              <Text
                style={[
                  styles.cell,
                  styles.price,
                ]}
              >
                {formatPdfCurrency(
                  item.unitPrice,
                  data.currency,
                )}
              </Text>

              {/* Total */}
              <Text
                style={[
                  styles.cell,
                  styles.amount,
                ]}
              >
                {formatPdfCurrency(
                  item.total,
                  data.currency,
                )}
              </Text>
            </View>
          );
        },
      )}
    </View>
  );
}