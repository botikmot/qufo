import {
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import type {
  QuotationPdfData,
} from "./quotation-pdf-types";

import { formatPdfCurrency } from "@/utils/currency";

const styles =
  StyleSheet.create({
    wrapper: {
      flexDirection:
        "row",

      justifyContent:
        "flex-end",

      marginTop: 14,
    },

    totals: {
      width: 220,
    },

    row: {
      flexDirection:
        "row",

      justifyContent:
        "space-between",

      paddingVertical: 5,
    },

    label: {
      fontSize: 8.5,

      color: "#6B7280",
    },

    value: {
      fontSize: 8.5,

      color: "#111827",

      fontWeight: 500,
    },

    totalRow: {
      marginTop: 5,

      paddingTop: 9,

      borderTopWidth: 1.5,

      borderTopColor:
        "#059669",
    },

    totalLabel: {
      fontSize: 10,

      fontWeight: 700,

      color: "#111827",
    },

    totalValue: {
      fontSize: 13,

      fontWeight: 700,

      color: "#059669",
    },
  });

type Props = {
  data:
    QuotationPdfData;
};

export function QuotationPdfTotals({
  data,
}: Props) {
  return (
    <View
      style={
        styles.wrapper
      }
      wrap={false}
    >
      <View
        style={
          styles.totals
        }
      >
        <View
          style={
            styles.row
          }
        >
          <Text
            style={
              styles.label
            }
          >
            Subtotal
          </Text>

          <Text
            style={
              styles.value
            }
          >
            {formatPdfCurrency(
              data.subtotal,
              data.currency,
            )}
          </Text>
        </View>

        {!!data.discountAmount && (
          <View
            style={
              styles.row
            }
          >
            <Text
              style={
                styles.label
              }
            >
              Discount
            </Text>

            <Text
              style={
                styles.value
              }
            >
              -
              {formatPdfCurrency(
                data.discountAmount,
                data.currency,
              )}
            </Text>
          </View>
        )}

        {!!data.taxAmount && (
          <View
            style={
              styles.row
            }
          >
            <Text
              style={
                styles.label
              }
            >
              Tax
            </Text>

            <Text
              style={
                styles.value
              }
            >
              {formatPdfCurrency(
                data.taxAmount,
                data.currency,
              )}
            </Text>
          </View>
        )}

        <View
          style={[
            styles.row,
            styles.totalRow,
          ]}
        >
          <Text
            style={
              styles.totalLabel
            }
          >
            TOTAL
          </Text>

          <Text
            style={
              styles.totalValue
            }
          >
            {formatPdfCurrency(
              data.total,
              data.currency,
            )}
          </Text>
        </View>
      </View>
    </View>
  );
}