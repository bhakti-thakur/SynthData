import type { DocumentPickerAsset } from "expo-document-picker";
import { Platform } from "react-native";
import { API_BASE_URL } from "./client";

type GenerateParams = {
  activeSegment: "Model" | "Schema";
  modelFile: DocumentPickerAsset | null;
  schemaFile: DocumentPickerAsset | null;
  schemaText: string;
  rows: string;
  batchSize: string;
  epochs: string;
  schemaRows: string;
};

type EvaluateParams = {
  activeSegment: "Statistical" | "Schema Check";
  realFile: DocumentPickerAsset | null;
  syntheticFile: DocumentPickerAsset | null;
  schemaFile: DocumentPickerAsset | null;
  schemaText: string;
  datasetId: string;
};

export async function generate(params: GenerateParams): Promise<any> {
  if (params.activeSegment === "Model") {
    const nRows = Number(params.rows);
    const batch = Number(params.batchSize);
    const epochCount = Number(params.epochs);

    if (!params.modelFile || Number.isNaN(nRows) || Number.isNaN(batch) || Number.isNaN(epochCount)) {
      throw new Error("Please select a file and fill in all fields.");
    }

    if (!params.modelFile.uri || !params.modelFile.name || !params.modelFile.mimeType) {
      throw new Error("Invalid file selection.");
    }

    const fileUri =
      params.modelFile.uri.startsWith("file://") || params.modelFile.uri.startsWith("content://")
        ? params.modelFile.uri
        : `file://${params.modelFile.uri}`;

    const formData = new FormData();
    if (Platform.OS === "web") {
      if (!params.modelFile.file) {
        throw new Error("Invalid file selection.");
      }
      formData.append("file", params.modelFile.file);
    } else {
      formData.append(
        "file",
        {
          uri: fileUri,
          name: params.modelFile.name,
          type: params.modelFile.mimeType,
        } as any,
      );
    }

    formData.append("n_rows", String(nRows));
    formData.append("epochs", String(epochCount));
    formData.append("batch_size", String(batch));
    formData.append("apply_constraints", "true");

    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: "POST",
      body: formData,
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload?.detail ?? "Request failed");
    }

    return payload;
  }

  const nRows = Number(params.schemaRows);
  let schemaPayload = params.schemaText.trim();

  if (schemaPayload.length === 0) {
    if (!params.schemaFile) {
      throw new Error("Please paste schema JSON and enter rows.");
    }

    if (Platform.OS === "web") {
      if (!params.schemaFile.file) {
        throw new Error("Invalid schema file selection.");
      }
      schemaPayload = await params.schemaFile.file.text();
    } else {
      if (!params.schemaFile.uri) {
        throw new Error("Invalid schema file selection.");
      }
      const schemaUri =
        params.schemaFile.uri.startsWith("file://") || params.schemaFile.uri.startsWith("content://")
          ? params.schemaFile.uri
          : `file://${params.schemaFile.uri}`;

      const schemaResponse = await fetch(schemaUri);
      schemaPayload = await schemaResponse.text();
    }
  }

  if (Number.isNaN(nRows)) {
    throw new Error("Please paste schema JSON and enter rows.");
  }

  const formData = new FormData();
  formData.append("data_schema", schemaPayload);
  formData.append("n_rows", String(nRows));

  const response = await fetch(`${API_BASE_URL}/generate`, {
    method: "POST",
    body: formData,
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.detail ?? "Request failed");
  }

  return payload;
}

export async function evaluate(params: EvaluateParams): Promise<any> {
  if (params.activeSegment === "Statistical") {
    if (!params.realFile) {
      throw new Error("Please upload a real dataset.");
    }

    if (!params.syntheticFile && params.datasetId.trim().length === 0) {
      throw new Error("Please upload a synthetic dataset or enter dataset ID.");
    }

    const formData = new FormData();

    if (Platform.OS === "web") {
      if (!params.realFile.file) {
        throw new Error("Invalid real file selection.");
      }
      formData.append("real_file", params.realFile.file);
    } else {
      if (!params.realFile.uri || !params.realFile.name || !params.realFile.mimeType) {
        throw new Error("Invalid real file selection.");
      }

      const realUri =
        params.realFile.uri.startsWith("file://") || params.realFile.uri.startsWith("content://")
          ? params.realFile.uri
          : `file://${params.realFile.uri}`;

      formData.append(
        "real_file",
        {
          uri: realUri,
          name: params.realFile.name,
          type: params.realFile.mimeType,
        } as any,
      );
    }

    if (params.syntheticFile) {
      if (Platform.OS === "web") {
        if (!params.syntheticFile.file) {
          throw new Error("Invalid synthetic file selection.");
        }
        formData.append("synthetic_file", params.syntheticFile.file);
      } else {
        if (!params.syntheticFile.uri || !params.syntheticFile.name || !params.syntheticFile.mimeType) {
          throw new Error("Invalid synthetic file selection.");
        }

        const synthUri =
          params.syntheticFile.uri.startsWith("file://") || params.syntheticFile.uri.startsWith("content://")
            ? params.syntheticFile.uri
            : `file://${params.syntheticFile.uri}`;

        formData.append(
          "synthetic_file",
          {
            uri: synthUri,
            name: params.syntheticFile.name,
            type: params.syntheticFile.mimeType,
          } as any,
        );
      }
    } else if (params.datasetId.trim().length > 0) {
      formData.append("dataset_id", params.datasetId.trim());
    }

    const response = await fetch(`${API_BASE_URL}/evaluate`, {
      method: "POST",
      body: formData,
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload?.detail ?? "Request failed");
    }

    return payload;
  }

  let schemaPayload = params.schemaText.trim();
  if (schemaPayload.length === 0) {
    if (!params.schemaFile) {
      throw new Error("Please upload a schema file or paste schema JSON.");
    }

    if (Platform.OS === "web") {
      if (!params.schemaFile.file) {
        throw new Error("Invalid schema file selection.");
      }
      schemaPayload = await params.schemaFile.file.text();
    } else {
      if (!params.schemaFile.uri) {
        throw new Error("Invalid schema file selection.");
      }
      const schemaUri =
        params.schemaFile.uri.startsWith("file://") || params.schemaFile.uri.startsWith("content://")
          ? params.schemaFile.uri
          : `file://${params.schemaFile.uri}`;
      const schemaResponse = await fetch(schemaUri);
      schemaPayload = await schemaResponse.text();
    }
  }

  if (!params.syntheticFile && params.datasetId.trim().length === 0) {
    throw new Error("Please upload a synthetic dataset or enter dataset ID.");
  }

  const formData = new FormData();
  formData.append("data_schema", schemaPayload);

  if (params.syntheticFile) {
    if (Platform.OS === "web") {
      if (!params.syntheticFile.file) {
        throw new Error("Invalid synthetic file selection.");
      }
      formData.append("synthetic_file", params.syntheticFile.file);
    } else {
      if (!params.syntheticFile.uri || !params.syntheticFile.name || !params.syntheticFile.mimeType) {
        throw new Error("Invalid synthetic file selection.");
      }
      const synthUri =
        params.syntheticFile.uri.startsWith("file://") || params.syntheticFile.uri.startsWith("content://")
          ? params.syntheticFile.uri
          : `file://${params.syntheticFile.uri}`;
      formData.append(
        "synthetic_file",
        {
          uri: synthUri,
          name: params.syntheticFile.name,
          type: params.syntheticFile.mimeType,
        } as any,
      );
    }
  } else {
    formData.append("dataset_id", params.datasetId.trim());
  }

  const response = await fetch(`${API_BASE_URL}/evaluate`, {
    method: "POST",
    body: formData,
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.detail ?? "Request failed");
  }

  return payload;
}
