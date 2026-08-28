import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import {
  QuotationPdfHeader,
} from "./quotation-pdf-header";

import {
  QuotationPdfItems,
} from "./quotation-pdf-items";

import {
  QuotationPdfSignatures,
} from "./quotation-pdf-signatures";

import {
  QuotationPdfTerms,
} from "./quotation-pdf-terms";

import {
  QuotationPdfTotals,
} from "./quotation-pdf-totals";

import type {
  QuotationPdfData,
} from "./quotation-pdf-types";

const styles =
  StyleSheet.create({
    page: {
      paddingTop: 38,
      paddingBottom: 44,
      paddingHorizontal: 42,

      backgroundColor:
        "#FFFFFF",

      fontFamily:
        "Helvetica",

      color: "#111827",
    },

    customerSection: {
      marginTop: 22,

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      gap: 24,
    },

    customerBlock: {
      width: "52%",
    },

    quotationMetaBlock: {
      width: "40%",
    },

    sectionEyebrow: {
      marginBottom: 6,

      fontSize: 7.5,

      fontWeight: 700,

      color: "#059669",

      letterSpacing: 0.7,

      textTransform:
        "uppercase",
    },

    customerName: {
      marginBottom: 4,

      fontSize: 11,

      fontWeight: 700,

      color: "#111827",
    },

    companyName: {
      marginBottom: 3,

      fontSize: 9,

      fontWeight: 500,

      color: "#374151",
    },

    detail: {
      marginBottom: 2,

      fontSize: 8,

      color: "#6B7280",

      lineHeight: 1.45,
    },

    metaCard: {
      padding: 12,

      borderWidth: 1,

      borderColor:
        "#E5E7EB",

      borderRadius: 5,

      backgroundColor:
        "#F8FAFC",
    },

    metaRow: {
      flexDirection:
        "row",

      justifyContent:
        "space-between",

      marginBottom: 5,
    },

    metaRowLast: {
      marginBottom: 0,
    },

    metaLabel: {
      fontSize: 7.5,

      color: "#64748B",
    },

    metaValue: {
      fontSize: 8,

      fontWeight: 600,

      color: "#111827",
    },

    notesSection: {
      marginTop: 22,

      paddingTop: 14,

      borderTopWidth: 1,

      borderTopColor:
        "#E5E7EB",
    },

    sectionTitle: {
      marginBottom: 7,

      fontSize: 7.5,

      fontWeight: 700,

      color: "#111827",

      letterSpacing: 0.6,

      textTransform:
        "uppercase",
    },

    sectionText: {
      fontSize: 8,

      color: "#4B5563",

      lineHeight: 1.55,
    },

    footerNoteContainer: {
      marginTop: 22,

      paddingTop: 12,

      borderTopWidth: 1,

      borderTopColor:
        "#F1F5F9",
    },

    footerNote: {
      textAlign:
        "center",

      fontSize: 7.8,

      color: "#6B7280",

      lineHeight: 1.5,
    },

    pageNumber: {
      position:
        "absolute",

      bottom: 18,

      left: 42,
      right: 42,

      textAlign:
        "center",

      fontSize: 7,

      color: "#9CA3AF",
    },
  });

type Props = {
  data:
    QuotationPdfData;
};

export function QuotationPdfDocument({
  data,
}: Props) {
  return (
    <Document
      title={`Quotation ${data.quotationNumber}`}
      author={
        data.business.name
      }
      subject={`Quotation ${data.quotationNumber}`}
      creator="QUFO"
      producer="QUFO"
    >
      <Page
        size="A4"
        style={
          styles.page
        }
      >
        {/*
         * -----------------------------------------
         * BUSINESS / DOCUMENT HEADER
         * -----------------------------------------
         */}
        <QuotationPdfHeader
          data={data}
        />

        {/*
         * -----------------------------------------
         * CUSTOMER INFORMATION
         * -----------------------------------------
         */}
        <View
          style={
            styles.customerSection
          }
          wrap={false}
        >
          <View
            style={
              styles.customerBlock
            }
          >
            <Text
              style={
                styles.sectionEyebrow
              }
            >
              Prepared For
            </Text>

            <Text
              style={
                styles.customerName
              }
            >
              {
                data.customer.name
              }
            </Text>

            {data.customer
              .companyName && (
              <Text
                style={
                  styles.companyName
                }
              >
                {
                  data.customer
                    .companyName
                }
              </Text>
            )}

            {data.customer
              .address && (
              <Text
                style={
                  styles.detail
                }
              >
                {
                  data.customer
                    .address
                }
              </Text>
            )}

            {data.customer
              .email && (
              <Text
                style={
                  styles.detail
                }
              >
                {
                  data.customer
                    .email
                }
              </Text>
            )}

            {data.customer
              .phone && (
              <Text
                style={
                  styles.detail
                }
              >
                {
                  data.customer
                    .phone
                }
              </Text>
            )}
          </View>

        </View>

        {/*
         * -----------------------------------------
         * QUOTATION ITEMS
         * -----------------------------------------
         */}
        <QuotationPdfItems
          data={data}
        />

        {/*
         * -----------------------------------------
         * TOTALS
         * -----------------------------------------
         */}
        <QuotationPdfTotals
          data={data}
        />

        {/*
         * -----------------------------------------
         * OPTIONAL NOTES
         * -----------------------------------------
         */}
        {data.notes?.trim() && (
          <View
            style={
              styles.notesSection
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Notes
            </Text>

            <Text
              style={
                styles.sectionText
              }
            >
              {
                data.notes.trim()
              }
            </Text>
          </View>
        )}

        {/*
         * -----------------------------------------
         * TERMS & CONDITIONS
         * -----------------------------------------
         */}
        <QuotationPdfTerms
          terms={
            data.terms
          }
        />

        {/*
         * -----------------------------------------
         * SIGNATURE / CONFORME
         * -----------------------------------------
         */}
        <QuotationPdfSignatures
          data={data}
        />

        {/*
         * -----------------------------------------
         * OPTIONAL FOOTER MESSAGE
         * -----------------------------------------
         */}
        {data.footerNote?.trim() && (
          <View
            style={
              styles.footerNoteContainer
            }
            wrap={false}
          >
            <Text
              style={
                styles.footerNote
              }
            >
              {
                data.footerNote.trim()
              }
            </Text>
          </View>
        )}

        {/*
         * -----------------------------------------
         * PAGE NUMBER
         * -----------------------------------------
         */}
        <Text
          style={
            styles.pageNumber
          }
          fixed
          render={({
            pageNumber,
            totalPages,
          }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
        />
      </Page>
    </Document>
  );
}