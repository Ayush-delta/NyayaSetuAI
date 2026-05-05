export interface ProcessedDocument {
  record_id: string;
  message: string;
  is_scanned: boolean;
  total_pages: number;
  chunks_created: number;
  processing_time_seconds: number;
  storage_url: string | null;
  data: {
    id: string;
    filename: string;
    storage_path: string | null;
    signed_url: string | null;
    file_hash: string;
    file_size: string;
    extracted_data: {
      case_details: {
        case_number: string;
        court_name: string;
        date_of_order: string;
        petitioner: string;
        respondent: string;
        judge_name: string | null;
      };
      judgment_metadata: {
        judgment_type: string;
        case_status: string | null;
        next_hearing_date: string | null;
        subject_matter: string;
        relief_granted: string;
        is_interim_order: boolean;
        has_contempt_risk: boolean;
        related_case_numbers: string[];
      };
      key_directions: string[];
      deadlines: string[];
      parties_involved: string[];
      raw_text_snippet: string;
    };
    action_plan: {
      action_type: string;
      action_required: string;
      responsible_department: string;
      secondary_departments: string[];
      priority: string;
      deadline: string;
      limitation_period: string | null;
      appeal_analysis: {
        is_appeal_recommended: boolean;
        limitation_days: number | null;
        limitation_expiry_date: string | null;
        appeal_court: string | null;
        grounds_for_appeal: string[];
        risk_if_not_appealed: string | null;
      };
      steps: string[];
      reasoning: string;
    };
    confidence_scores: Record<string, number>;
    compliance_tracking: {
      compliance_status: string;
      updates: any[];
    };
    verification_status: string;
    source_highlights: string[];
    is_scanned: boolean;
    total_pages: string;
    processing_time: number;
    upload_timestamp: string;
    vector_namespace: string;
  };
}

export const documentService = {
  // Save a document to localStorage
  saveDocument: (doc: ProcessedDocument): void => {
    if (typeof window === "undefined") return;
    const existing = documentService.getAllDocuments();
    const index = existing.findIndex((d) => d.record_id === doc.record_id);
    if (index >= 0) {
      existing[index] = doc;
    } else {
      existing.push(doc);
    }
    localStorage.setItem("nyayasetu_documents", JSON.stringify(existing));
  },

  // Get all documents from localStorage
  getAllDocuments: (): ProcessedDocument[] => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem("nyayasetu_documents");
    return data ? JSON.parse(data) : [];
  },

  // Get a specific document by ID
  getDocumentById: (id: string): ProcessedDocument | null => {
    const docs = documentService.getAllDocuments();
    return docs.find((d) => d.record_id === id) || null;
  },

  // Delete a document by ID
  deleteDocument: (id: string): void => {
    if (typeof window === "undefined") return;
    const docs = documentService.getAllDocuments();
    const filtered = docs.filter((d) => d.record_id !== id);
    localStorage.setItem("nyayasetu_documents", JSON.stringify(filtered));
  },
};
