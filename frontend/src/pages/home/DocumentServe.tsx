// MyDocument.tsx
import { Document, Page, Text, StyleSheet } from "@react-pdf/renderer";

interface MyDocumentProps {
  title: string;
  description: string;
  createdAt?: string;
}

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12 },
  title: { fontSize: 16, marginBottom: 10 },
  description: { marginBottom: 10 },
  footer: { position: "absolute", bottom: 30, fontSize: 10, color: "#888" },
});

export default function MyDocument({
  title,
  description,
  createdAt,
}: MyDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        {createdAt && (
          <Text style={styles.footer}>Created at: {createdAt}</Text>
        )}
      </Page>
    </Document>
  );
}
