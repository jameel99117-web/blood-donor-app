import React from "react";
import { FlatList, Text } from "react-native";
import DonorCard from "./DonorCard";

export default function DonorList({ donors, navigation }) {
  if (donors.length === 0) {
    return <Text>No donors found</Text>;
  }

  return (
    <FlatList
      data={donors}
      keyExtractor={(_, i) => i.toString()}
      renderItem={({ item }) => (
        <DonorCard donor={item} navigation={navigation} />
      )}
    />
  );
}
