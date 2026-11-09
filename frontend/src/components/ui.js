import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export const colors = {
  forest: "#39E58C",
  petrol: "#8FF5BD",
  lime: "#39E58C",
  ink: "#F0F7F3",
  muted: "#9BB3A7",
  paper: "#080F0D",
  border: "rgba(255,255,255,0.12)",
  danger: "#FF727B",
  surface: "#111C18",
  elevated: "#20392D",
  body: "#B6C8BF",
};
const heading = Platform.OS === "web" ? "Manrope, sans-serif" : undefined;
const mono = Platform.OS === "web" ? '"Geist Mono", monospace' : "monospace";
export function Button({
  children,
  onPress,
  secondary = false,
  disabled = false,
  danger = false,
}) {
  const [focused, setFocused] = React.useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onPress={onPress}
      style={({ pressed, hovered }) => [
        styles.button,
        {
          backgroundColor: danger
            ? "#3B1F25"
            : secondary
              ? hovered
                ? colors.elevated
                : "transparent"
              : "#F0F7F3",
          borderColor: focused
            ? colors.petrol
            : danger
              ? colors.danger
              : colors.border,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          opacity: disabled ? 0.45 : pressed ? 0.75 : 1,
        },
      ]}
    >
      <Text
        style={{
          color: danger ? colors.danger : secondary ? colors.ink : colors.paper,
          fontWeight: "700",
          fontSize: 14,
          fontFamily: heading,
        }}
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
  const [focused, setFocused] = React.useState(false);
  return (
    <View style={{ gap: 8, marginBottom: 16, flexShrink: 1 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        placeholderTextColor={colors.muted}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          styles.input,
          focused && {
            borderColor: colors.petrol,
            backgroundColor: "rgba(255,255,255,0.15)",
          },
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
      <Text
        style={{
          color: colors.lime,
          fontSize: 11,
          fontFamily: mono,
          lineHeight: 18,
        }}
      >
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
    <Card style={{ flexGrow: 1, flexBasis: 220, minWidth: 0 }}>
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
    minHeight: 52,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 3,
    borderWidth: 1,
    ...Platform.select({
      web: { transition: "background-color 300ms ease, transform 100ms ease" },
    }),
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontFamily: mono,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    color: colors.ink,
    minHeight: 60,
    fontFamily: mono,
    fontSize: 13,
    ...Platform.select({ web: { outlineStyle: "none" } }),
  },
  card: {
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginBottom: 24,
    gap: 12,
  },
  cardTitle: {
    color: colors.ink,
    fontWeight: "500",
    fontFamily: heading,
    fontSize: 20,
    marginBottom: 4,
  },
  paragraph: {
    color: colors.body,
    fontFamily: mono,
    fontSize: 13,
    lineHeight: 24,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(57,229,140,0.12)",
    borderRadius: 4,
    paddingHorizontal: 12,
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
    fontSize: 36,
    fontFamily: heading,
    fontWeight: "500",
    marginTop: 8,
  },
});
