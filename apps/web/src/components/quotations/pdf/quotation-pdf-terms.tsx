import {
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

const styles =
  StyleSheet.create({
    section: {
      marginTop: 24,

      paddingTop: 14,

      borderTopWidth: 1,

      borderTopColor:
        "#E5E7EB",
    },

    title: {
      fontSize: 8,

      fontWeight: 700,

      color: "#111827",

      textTransform:
        "uppercase",

      letterSpacing: 0.65,

      marginBottom: 7,
    },

    text: {
      fontSize: 8,

      color: "#4B5563",

      lineHeight: 1.55,
    },
  });

type Props = {
  terms?:
    | string
    | null;
};

export function QuotationPdfTerms({
  terms,
}: Props) {
  if (!terms?.trim()) {
    return null;
  }

  return (
    <View
      style={
        styles.section
      }
    >
      <Text
        style={
          styles.title
        }
      >
        Terms & Conditions
      </Text>

      <Text
        style={
          styles.text
        }
      >
        {terms.trim()}
      </Text>
    </View>
  );
}