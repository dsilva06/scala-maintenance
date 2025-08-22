/**
 * Lightweight API client placeholder. This removes the dependency on an
 * external SDK while preserving the same interface so the rest of the
 * application can evolve independently.
 */
export const apiClient = {
  entities: {
    Vehicle: class Vehicle {},
    MaintenanceOrder: class MaintenanceOrder {},
    Inspection: class Inspection {},
    SparePart: class SparePart {},
    Document: class Document {},
    RepairGuide: class RepairGuide {},
    Trip: class Trip {},
    Alert: class Alert {},
    ChatMessage: class ChatMessage {},
    Driver: class Driver {}
  },
  integrations: {
    Core: {
      InvokeLLM: async () => {
        throw new Error('InvokeLLM not implemented');
      },
      SendEmail: async () => {
        throw new Error('SendEmail not implemented');
      },
      UploadFile: async () => {
        throw new Error('UploadFile not implemented');
      },
      GenerateImage: async () => {
        throw new Error('GenerateImage not implemented');
      },
      ExtractDataFromUploadedFile: async () => {
        throw new Error('ExtractDataFromUploadedFile not implemented');
      }
    }
  },
  auth: {}
};

