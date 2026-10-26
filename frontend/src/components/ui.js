import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export const colors = {
  forest: "#123C32",
  petrol: "#154C5A",
  lime: "#C6E6A9",
  ink: "#213C35",
  muted: "#667C74",
  paper: "#F1F5EF",
  border: "#DCE5DD",
  danger: "#9B352F",
};
export function Button({
  children,
  onPress,
  secondary = false,
  disabled = false,
  danger = false,
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: danger
            ? colors.danger
            : secondary
              ? "#E7EDE5"
              : colors.petrol,
          opacity: disabled ? 0.45 : pressed ? 0.75 : 1,
        },
      ]}
    >
      <Text
        style={{ color: secondary ? colors.ink : "white", fontWeight: "600" }}
      >
        {children}
      </Text>
    </Pressable>
  );
}
export function Field({
  label,
  value,
  onChangeText,
  multiline = false,
  secureTextEntry = false,
  ...props
}) {
  return (
    <View style={{ gap: 7, marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        style={[
          styles.input,
          multiline && { minHeight: 115, textAlignVertical: "top" },
        ]}
        {...props}
      />
    </View>
  );
}
export function Card({ title, children, style }) {
  return (
    <View style={[styles.card, style]}>
      {title && <Text style={styles.cardTitle}>{title}</Text>}
      {children}
    </View>
  );
}
export function Paragraph({ children, muted = false }) {
  return (
    <Text style={[styles.paragraph, muted && { color: colors.muted }]}>
      {children}
    </Text>
  );
}
export function Badge({ children }) {
  return (
    <View style={styles.badge}>
      <Text style={{ color: colors.forest, fontSize: 12, fontWeight: "600" }}>
        {children}
      </Text>
    </View>
  );
}
export function Row({ children }) {
  return <View style={styles.row}>{children}</View>;
}
export function Metric({ label, value, note }) {
  return (
    <Card style={{ flexGrow: 1, minWidth: 150 }}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.metric}>{value}</Text>
      {note && <Paragraph muted>{note}</Paragraph>}
    </Card>
  );
}
export function Loading() {
  return (
    <View style={{ padding: 30 }}>
      <ActivityIndicator color={colors.petrol} />
    </View>
  );
}
export const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 3,
  },
  label: { color: colors.ink, fontSize: 13, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#A7BAB0",
    borderRadius: 9,
    padding: 12,
    backgroundColor: "white",
    color: colors.ink,
    minHeight: 46,
  },
  card: {
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: "white",
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    color: colors.ink,
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 4,
  },
  paragraph: { color: colors.ink, fontSize: 14, lineHeight: 23 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#E7F0D9",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "center",
  },
  metric: {
    color: colors.petrol,
    fontSize: 30,
    fontWeight: "700",
    marginTop: 8,
  },
});
