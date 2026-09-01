import {
  Image,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import type {
  QuotationPdfData,
} from "./quotation-pdf-types";

const styles =
  StyleSheet.create({
    wrapper: {
      marginTop: 34,

      flexDirection:
        "row",

      justifyContent:
        "space-between",
    },

    block: {
      width: "43%",
    },

    heading: {
      fontSize: 7.5,

      color: "#6B7280",

      textTransform:
        "uppercase",

      letterSpacing: 0.6,

      marginBottom: 8,
    },

    signatureArea: {
      height: 38,

      justifyContent:
        "flex-end",

      alignItems:
        "flex-start",
    },

    signatureImage: {
      width: 100,

      height: 36,

      objectFit:
        "contain",
    },

    line: {
      borderTopWidth: 1,

      borderTopColor:
        "#9CA3AF",

      paddingTop: 6,
    },

    name: {
      fontSize: 8.5,

      fontWeight: 600,

      color: "#111827",
    },

    detail: {
      marginTop: 3,

      fontSize: 7.5,

      color: "#6B7280",
    },

    dateLine: {
      marginTop: 14,

      fontSize: 7.5,

      color: "#6B7280",
    },
  });

type Props = {
  data:
    QuotationPdfData;
};

export function QuotationPdfSignatures({
  data,
}: Props) {
  const showSignature =
    data.showQuotationSignature &&
    Boolean(
      data.authorizedSignatureUrl,
    );

  const signatoryName =
    data.authorizedSignatoryName
      ?.trim() ||
    data.preparedBy;

  const signatoryTitle =
    data.authorizedSignatoryTitle
      ?.trim() ||
    null;

  console.log('signatore:: ', data)

  return (
    <View
      style={
        styles.wrapper
      }
      wrap={false}
    >
      {/* Business / authorized signature */}
      <View
        style={
          styles.block
        }
      >
        <Text
          style={
            styles.heading
          }
        >
          Prepared /
          Authorized By
        </Text>

        <View
          style={
            styles.signatureArea
          }
        >
          {showSignature &&
            data.authorizedSignatureUrl && (
              <Image
                src={
                  data.authorizedSignatureUrl
                }
                style={
                  styles.signatureImage
                }
              />
            )}
        </View>

        <View
          style={
            styles.line
          }
        >
          <Text
            style={
              styles.name
            }
          >
            {signatoryName}
          </Text>

          {signatoryTitle && (
            <Text
              style={
                styles.detail
              }
            >
              {signatoryTitle}
            </Text>
          )}

          <Text
            style={
              styles.dateLine
            }
          >
            Date:
            __________________
          </Text>
        </View>
      </View>

      {/* Customer signature */}
      <View
        style={
          styles.block
        }
      >
        <Text
          style={
            styles.heading
          }
        >
          Accepted /
          Conforme
        </Text>

        <View
          style={
            styles.signatureArea
          }
        />

        <View
          style={
            styles.line
          }
        >
          <Text
            style={
              styles.name
            }
          >
            Signature over
            Printed Name
          </Text>

          <Text
            style={
              styles.dateLine
            }
          >
            Date:
            __________________
          </Text>
        </View>
      </View>
    </View>
  );
}