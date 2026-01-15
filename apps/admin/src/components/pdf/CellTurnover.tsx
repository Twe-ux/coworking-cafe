import { StyleSheet, Text, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  containerFirst: {
    flex: 1,
    paddingLeft: 10,
    display: "flex",
    justifyContent: "center",
  },
  labelFirst: {
    fontSize: 10,
    fontWeight: "bold",
  },
  containerOther: {
    flex: 1,
    borderLeft: "0.5px solid rgba(0, 0, 0, 0.1)",
    height: "100%",
    display: "flex",
    justifyContent: "center",
  },
  labelOther: {
    fontSize: 9,
    textAlign: "center",
    lineHeight: 1.3,
    paddingVertical: 2,
  },
});

interface CellTurnoverProps {
  value: string | number;
  place: "first" | "other";
}

export function CellTurnover({ value, place }: CellTurnoverProps) {
  const roundedValue =
    typeof value === "number" ? value.toFixed(2) + " €" : value;

  return (
    <View
      style={styles[place === "first" ? "containerFirst" : "containerOther"]}
    >
      <Text style={styles[place === "first" ? "labelFirst" : "labelOther"]}>
        {roundedValue}
      </Text>
    </View>
  );
}
