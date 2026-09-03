import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import {
  QuotationPdfItems,
} from "@/components/quotations/pdf/quotation-pdf-items";

import {
  QuotationPdfTotals,
} from "@/components/quotations/pdf/quotation-pdf-totals";

import {
  formatPdfDate,
} from "@/components/quotations/pdf/quotation-pdf-utils";

import {
  JobPdfHeader,
} from "./job-pdf-header";

import {
  JobPdfTracking,
} from "./job-pdf-tracking";

import type {
  JobPdfData,
} from "./job-pdf-types";

import {
  formatJobPdfLabel,
} from "./job-pdf-utils";

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

    metaBlock: {
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

      marginBottom: 6,
    },

    metaRowLast: {
      marginBottom: 0,
    },

    metaLabel: {
      fontSize: 7.5,

      color: "#64748B",
    },

    metaValue: {
      maxWidth: "60%",

      fontSize: 8,

      fontWeight: 600,

      color: "#111827",

      textAlign:
        "right",
    },

    summarySection: {
      marginTop: 22,

      padding: 13,

      borderWidth: 1,

      borderColor:
        "#E5E7EB",

      borderRadius: 5,

      backgroundColor:
        "#FFFFFF",
    },

    jobTitle: {
      fontSize: 11,

      fontWeight: 700,

      color: "#111827",
    },

    description: {
      marginTop: 6,

      fontSize: 8,

      color: "#4B5563",

      lineHeight: 1.55,
    },

    footer: {
      marginTop: 22,

      paddingTop: 12,

      borderTopWidth: 1,

      borderTopColor:
        "#F1F5F9",

      textAlign:
        "center",

      fontSize: 7.5,

      color: "#9CA3AF",
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
  data: JobPdfData;
};

export function JobPdfDocument({
  data,
}: Props) {
  return (
    <Document
      title={`Job Confirmation ${data.jobNumber}`}
      author={
        data.business.name
      }
      subject={`Job Confirmation ${data.jobNumber}`}
      creator="QUFO"
      producer="QUFO"
    >
      <Page
        size="A4"
        style={styles.page}
      >
        <JobPdfHeader
          data={data}
        />

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
              Customer
            </Text>

            <Text
              style={
                styles.customerName
              }
            >
              {data.customer.name}
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

          <View
            style={styles.metaBlock}
          >
            <View
              style={styles.metaCard}
            >
              {/* <View
                style={styles.metaRow}
              >
                <Text
                  style={
                    styles.metaLabel
                  }
                >
                  Status
                </Text>

                <Text
                  style={
                    styles.metaValue
                  }
                >
                  {formatJobPdfLabel(
                    data.status,
                  )}
                </Text>
              </View> */}

              <View
                style={styles.metaRow}
              >
                <Text
                  style={
                    styles.metaLabel
                  }
                >
                  Priority
                </Text>

                <Text
                  style={
                    styles.metaValue
                  }
                >
                  {formatJobPdfLabel(
                    data.priority,
                  )}
                </Text>
              </View>

              {data.dueDate && (
                <View
                  style={
                    styles.metaRow
                  }
                >
                  <Text
                    style={
                      styles.metaLabel
                    }
                  >
                    Expected
                  </Text>

                  <Text
                    style={
                      styles.metaValue
                    }
                  >
                    {formatPdfDate(
                      data.dueDate,
                    )}
                  </Text>
                </View>
              )}

              <View
                style={[
                  styles.metaRow,
                  styles.metaRowLast,
                ]}
              >
                <Text
                  style={
                    styles.metaLabel
                  }
                >
                  Quotation
                </Text>

                <Text
                  style={
                    styles.metaValue
                  }
                >
                  {data.quotationNumber ??
                    "—"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View
          style={
            styles.summarySection
          }
          wrap={false}
        >
          <Text
            style={
              styles.sectionEyebrow
            }
          >
            Job
          </Text>

          <Text
            style={
              styles.jobTitle
            }
          >
            {data.title}
          </Text>

          {data.description?.trim() && (
            <Text
              style={
                styles.description
              }
            >
              {
                data.description.trim()
              }
            </Text>
          )}
        </View>

        <QuotationPdfItems
          data={data}
        />

        <QuotationPdfTotals
          data={data}
        />

        <JobPdfTracking
          data={data}
        />

        <Text
          style={styles.footer}
        >
          This job confirmation
          was generated securely
          through QUFO.
        </Text>

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