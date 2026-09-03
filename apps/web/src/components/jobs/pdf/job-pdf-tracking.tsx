import {
  Image,
  Link,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import type {
  JobPdfData,
} from "./job-pdf-types";

const styles =
  StyleSheet.create({
    section: {
      marginTop: 24,

      padding: 14,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        "#A7F3D0",

      borderRadius: 6,

      backgroundColor:
        "#F0FDF4",
    },

    qrContainer: {
      width: 94,
      height: 94,

      flexShrink: 0,

      marginRight: 16,

      padding: 5,

      justifyContent:
        "center",

      alignItems:
        "center",

      backgroundColor:
        "#FFFFFF",

      borderWidth: 1,

      borderColor:
        "#D1FAE5",

      borderRadius: 5,
    },

    qrCode: {
      width: 82,
      height: 82,
    },

    content: {
      flexBasis: 0,

      flexGrow: 1,

      flexShrink: 1,

      minWidth: 0,

      paddingRight: 4,
    },

    eyebrow: {
      marginBottom: 6,

      fontSize: 7.5,

      fontWeight: 700,

      color: "#059669",

      letterSpacing: 0.7,

      textTransform:
        "uppercase",
    },

    title: {
      marginBottom: 5,

      fontSize: 12,

      fontWeight: 700,

      color: "#111827",
    },

    description: {
      marginBottom: 9,

      fontSize: 8,

      color: "#4B5563",

      lineHeight: 1.5,
    },

    link: {
      fontSize: 8.5,

      fontWeight: 700,

      color: "#047857",

      textDecoration:
        "none",
    },

    reference: {
      marginTop: 6,

      fontSize: 7,

      color: "#6B7280",
    },
  });

type Props = {
  data: JobPdfData;
};

export function JobPdfTracking({
  data,
}: Props) {
  return (
    <View
      style={styles.section}
      wrap={false}
    >
      <View
        style={
          styles.qrContainer
        }
      >
        <Image
          src={
            data.qrCodeDataUrl
          }
          style={
            styles.qrCode
          }
        />
      </View>

      <View
        style={styles.content}
      >
        <Text
          style={
            styles.eyebrow
          }
        >
          Customer Tracking
        </Text>

        <Text
          style={styles.title}
        >
          Scan to track your
          order
        </Text>

        <Text
          style={
            styles.description
          }
        >
          Scan the QR code to view
          the latest job progress,
          expected completion date,
          and public updates.
        </Text>

        <Link
          src={data.trackingUrl}
          style={styles.link}
        >
          Open tracking page
        </Link>

        <Text
          style={
            styles.reference
          }
        >
          Reference:{" "}
          {data.jobNumber}
        </Text>
      </View>
    </View>
  );
}