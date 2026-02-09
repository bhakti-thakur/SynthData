import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "./Card";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

export type StatisticalEvaluationResult = {
  message: string;
  ks_test: Record<
    string,
    {
      statistic: number;
      p_value: number;
      similar: boolean;
    }
  >;
  chi_square: Record<
    string,
    {
      statistic: number;
      p_value: number;
      similar: boolean;
    }
  >;
  correlation_mse: number;
  adversarial_auc: number;
  interpretation: Record<string, string>;
};

export type SchemaEvaluationResult = {
  schema_validity: string;
  type_consistency: string;
  range_violations: number;
  category_violations: number;
  null_rate: Record<string, number>;
  identifier_issues: string | null;
  message: string;
};

type EvaluationResultCardProps = {
  variant: "statistical" | "schema";
  statisticalResult?: StatisticalEvaluationResult;
  schemaResult?: SchemaEvaluationResult;
};

export function EvaluationResultCard({
  variant,
  statisticalResult,
  schemaResult,
}: EvaluationResultCardProps) {
  if (variant === "statistical" && statisticalResult) {
    return (
      <Card style={styles.card}>
        <Text style={styles.title}>{statisticalResult.message}</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>KS Test</Text>
          {Object.entries(statisticalResult.ks_test).map(([key, value]) => (
            <Text key={key} style={styles.rowText}>
              {key}: stat {value.statistic.toFixed(4)}, p {value.p_value.toFixed(4)}
            </Text>
          ))}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi-square</Text>
          {Object.entries(statisticalResult.chi_square).map(([key, value]) => (
            <Text key={key} style={styles.rowText}>
              {key}: stat {value.statistic.toFixed(4)}, p {value.p_value.toFixed(4)}
            </Text>
          ))}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Metrics</Text>
          <Text style={styles.rowText}>
            Correlation MSE: {statisticalResult.correlation_mse.toFixed(4)}
          </Text>
          <Text style={styles.rowText}>
            Adversarial AUC: {statisticalResult.adversarial_auc.toFixed(4)}
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interpretation</Text>
          {Object.entries(statisticalResult.interpretation).map(([key, value]) => (
            <Text key={key} style={styles.rowText}>
              {value}
            </Text>
          ))}
        </View>
      </Card>
    );
  }

  if (variant === "schema" && schemaResult) {
    return (
      <Card style={styles.card}>
        <Text style={styles.title}>{schemaResult.message}</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.rowText}>Schema validity: {schemaResult.schema_validity}</Text>
          <Text style={styles.rowText}>Type consistency: {schemaResult.type_consistency}</Text>
          <Text style={styles.rowText}>Range violations: {schemaResult.range_violations}</Text>
          <Text style={styles.rowText}>
            Category violations: {schemaResult.category_violations}
          </Text>
          <Text style={styles.rowText}>
            Identifier issues: {schemaResult.identifier_issues ?? "None"}
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Null rates</Text>
          {Object.entries(schemaResult.null_rate).map(([key, value]) => (
            <Text key={key} style={styles.rowText}>
              {key}: {value.toFixed(2)}
            </Text>
          ))}
        </View>
      </Card>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.md,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  section: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.md,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  rowText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
});
