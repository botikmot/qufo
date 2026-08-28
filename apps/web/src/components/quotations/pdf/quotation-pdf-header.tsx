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
  formatPdfDate,
  getPdfLogoUrl,
} from "./quotation-pdf-utils";

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

      maxWidth: "65%",
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
      fontSize: 15,

      fontWeight: 700,

      color: "#111827",

      marginBottom: 5,
    },

    businessDetail: {
      fontSize: 8.5,

      color: "#6B7280",

      lineHeight: 1.45,

      marginBottom: 2,
    },

    documentSection: {
      alignItems:
        "flex-end",
    },

    documentTitle: {
      fontSize: 21,

      fontWeight: 700,

      color: "#111827",

      letterSpacing: 1.4,

      marginBottom: 7,
    },

    quotationNumber: {
      fontSize: 9.5,

      fontWeight: 700,

      color: "#059669",

      marginBottom: 5,
    },

    revision: {
      fontSize: 8,

      color: "#6B7280",

      marginBottom: 7,
    },

    date: {
      fontSize: 8.5,

      color: "#6B7280",
    },
  });

type Props = {
  data:
    QuotationPdfData;
};

export function QuotationPdfHeader({
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
              src={
                logoUrl
              }
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
            {
              data.business
                .name
            }
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
          QUOTATION
        </Text>

        <Text
          style={
            styles.quotationNumber
          }
        >
          {
            data.quotationNumber
          }
        </Text>

        {!!data.revisionNumber &&
          data.revisionNumber >
            1 && (
            <Text
              style={
                styles.revision
              }
            >
              Revision{" "}
              {
                data.revisionNumber
              }
            </Text>
          )}

        <Text
          style={
            styles.date
          }
        >
          Date:{" "}
          {formatPdfDate(
            data.issueDate,
          )}
        </Text>

        {data.validUntil && (
          <Text
            style={
              styles.date
            }
          >
            Valid until:{" "}
            {formatPdfDate(
              data.validUntil,
            )}
          </Text>
        )}
      </View>
    </View>
  );
}