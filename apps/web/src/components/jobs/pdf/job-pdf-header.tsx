import {
  Image,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import {
  formatPdfDate,
  getPdfLogoUrl,
} from "@/components/quotations/pdf/quotation-pdf-utils";

import type {
  JobPdfData,
} from "./job-pdf-types";

const styles =
  StyleSheet.create({
    header: {
      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "flex-start",

      paddingBottom: 22,

      borderBottomWidth: 1,

      borderBottomColor:
        "#E5E7EB",
    },

    brandSection: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      width: "55%",
    },

    logoBox: {
      width: 62,
      height: 62,

      marginRight: 14,

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    logo: {
      maxWidth: 62,
      maxHeight: 62,

      objectFit:
        "contain",
    },

    businessName: {
      marginBottom: 5,

      fontSize: 15,

      fontWeight: 700,

      color: "#111827",
    },

    businessDetail: {
      marginBottom: 2,

      fontSize: 8.5,

      color: "#6B7280",

      lineHeight: 1.45,
    },

    documentSection: {
      width: "43%",

      alignItems:
        "flex-end",
    },

    documentTitle: {
      marginBottom: 7,

      fontSize: 15,

      fontWeight: 700,

      color: "#111827",

      letterSpacing: 0.7,

      textAlign:
        "right",
    },

    jobNumber: {
      marginBottom: 7,

      fontSize: 9.5,

      fontWeight: 700,

      color: "#059669",
    },

    date: {
      marginBottom: 3,

      fontSize: 8.5,

      color: "#6B7280",
    },
  });

type Props = {
  data: JobPdfData;
};

export function JobPdfHeader({
  data,
}: Props) {
  const logoUrl =
    getPdfLogoUrl(
      data.business.logoUrl,
    );

  return (
    <View style={styles.header}>
      <View
        style={
          styles.brandSection
        }
      >
        {logoUrl && (
          <View
            style={
              styles.logoBox
            }
          >
            <Image
              src={logoUrl}
              style={
                styles.logo
              }
            />
          </View>
        )}

        <View>
          <Text
            style={
              styles.businessName
            }
          >
            {data.business.name}
          </Text>

          {data.business
            .address && (
            <Text
              style={
                styles.businessDetail
              }
            >
              {
                data.business
                  .address
              }
            </Text>
          )}

          {data.business
            .email && (
            <Text
              style={
                styles.businessDetail
              }
            >
              {
                data.business
                  .email
              }
            </Text>
          )}

          {data.business
            .phone && (
            <Text
              style={
                styles.businessDetail
              }
            >
              {
                data.business
                  .phone
              }
            </Text>
          )}
        </View>
      </View>

      <View
        style={
          styles.documentSection
        }
      >
        <Text
          style={
            styles.documentTitle
          }
        >
          JOB CONFIRMATION
        </Text>

        <Text
          style={
            styles.jobNumber
          }
        >
          {data.jobNumber}
        </Text>

        <Text
          style={
            styles.date
          }
        >
          Created:{" "}
          {formatPdfDate(
            data.createdAt,
          )}
        </Text>

        {data.dueDate && (
          <Text
            style={
              styles.date
            }
          >
            Expected:{" "}
            {formatPdfDate(
              data.dueDate,
            )}
          </Text>
        )}
      </View>
    </View>
  );
}