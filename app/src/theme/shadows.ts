import { Platform } from "react-native";
import { colors } from "./colors";

export const shadows = {
  card: Platform.select({
    ios: {
      shadowColor: colors.shadow,
      shadowOpacity: 1,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
    },
    android: {
      elevation: 6,
    },
    default: {},
  }),
};
