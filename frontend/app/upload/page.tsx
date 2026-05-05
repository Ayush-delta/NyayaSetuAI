"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, File, X, CheckCircle2, Loader2 } from "lucide-react";
import ProtectedWrapper from "../components/ProtectedWrapper";
import { documentService } from "../services/documentService";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
      } else {
        alert("Please upload a PDF file.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
      } else {
        alert("Please upload a PDF file.");
      }
    }
  };

  const handleUpload = () => {
    if (!file) return;

    setIsUploading(true);

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    // Simulate backend processing and response
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);

      // Mock Response from backend based on user's JSON structure
      const recordId = crypto.randomUUID();
      const mockResponse = {
        record_id: recordId,
        message: "Judgment processed successfully",
        is_scanned: false,
        total_pages: 15,
        chunks_created: 63,
        processing_time_seconds: 20.97,
        storage_url: null,
        data: {
          id: recordId,
          filename: file.name,
          storage_path: null,
          signed_url: null,
          file_hash: "6dc1fc1e6a1c689e740b5df191add900",
          file_size: file.size.toString(),
          extracted_data: {
            case_details: {
              case_number: "CRP.No.1346 of 2026",
              court_name: "HIGH COURT",
              date_of_order: "29-04-2026",
              petitioner: "Ms.Venkata Aswini Reddy Koyya @ Ashu Reddy",
              respondent: "Mr. Yenumula Satyanarayana Murthy and 32 others",
              judge_name: null
            },
            judgment_metadata: {
              judgment_type: "Civil Revision",
              subject_matter: "Service Matter / Land / Contempt / etc",
              relief_granted: "restraining the respondents",
              is_interim_order: true,
              has_contempt_risk: false,
              related_case_numbers: [
                "I.A.No.576 of 2026",
                "O.S.No.176 of 2026"
              ]
            },
            key_directions: [
              "restraining the respondents",
              "injunction"
            ],
            deadlines: [
              "06.05.2026",
              "06.07.2026"
            ],
            parties_involved: [
              "Ms.Venkata Aswini Reddy Koyya @ Ashu Reddy",
              "Mr. Yenumula Satyanarayana Murthy and 32 others"
            ],
            raw_text_snippet: "The instant Civil Revision Petition has been filed by the petitioner under Article 227 of the Constitution of India assailing the order dated 28.04.2026 in I.A.No.576 of 2026 in O.S.No.176 of 2026 passed by the XI Additional Chief Judge, City Civil Court, at Hyderabad, insofar as the Trial Court declined to grant ex parte ad interim injunction."
          },
          action_plan: {
            action_type: "compliance",
            action_required: "Comply with the order of the High Court dated 29-04-2026 in CRP.No.1346 of 2026.",
            responsible_department: "Department of Law and Parliamentary Affairs",
            secondary_departments: [
              "Department of Revenue"
            ],
            priority: "high",
            deadline: "06.05.2026",
            limitation_period: null,
            appeal_analysis: {
              is_appeal_recommended: false,
              limitation_days: null,
              limitation_expiry_date: null,
              appeal_court: null,
              grounds_for_appeal: [],
              risk_if_not_appealed: null
            },
            steps: [
              "Review the order of the High Court and identify the specific directions to be complied with.",
              "Notify the respondents of the order and ensure compliance with the restraining order.",
              "File a compliance report with the High Court by the deadline of 06.05.2026."
            ],
            reasoning: "The High Court has passed an order dated 29-04-2026 in CRP.No.1346 of 2026, which requires compliance by the Department of Law and Parliamentary Affairs. The order is interim in nature and does not involve any contempt risk. The deadline for compliance is 06.05.2026, which is within 30 days, making it a high-priority action."
          },
          confidence_scores: {
            case_details: 1,
            judgment_metadata: 1,
            key_directions: 1,
            deadlines: 1,
            action_type: 1,
            responsible_department: 1,
            overall: 1
          },
          compliance_tracking: {
            compliance_status: "not_started",
            updates: []
          },
          verification_status: "pending",
          source_highlights: [
            "restraining the respondents"
          ],
          is_scanned: false,
          total_pages: "15",
          processing_time: 20.97,
          upload_timestamp: new Date().toISOString(),
          vector_namespace: `record_${recordId}`
        }
      };

      // Save to localStorage
      documentService.saveDocument(mockResponse as any);

      // Redirect to edit page
      setTimeout(() => {
        router.push(`/edit/${recordId}`);
      }, 500);

    }, 3000);
  };

  return (
    <ProtectedWrapper>
      <div className="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center p-6 sm:p-12 bg-slate-50">
        <div className="w-full max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Upload Legal Document
            </h1>
            <p className="mt-4 text-slate-600">
              Upload a PDF judgment, contract, or petition for AI analysis and data extraction.
            </p>
          </div>

          <div
            className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12"
          >
            {!file ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
                  isDragging ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
                }`}
              >
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <div className="mb-4 rounded-full bg-blue-50 border border-blue-100 p-4 shadow-sm">
                  <UploadCloud className="text-blue-600" size={32} />
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">
                  Click or drag and drop to upload
                </h3>
                <p className="text-sm text-slate-500">PDF files up to 50MB</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-50 border border-slate-200 shadow-sm">
                  <File className="text-blue-600" size={40} />
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">{file.name}</h3>
                <p className="mb-8 text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>

                {isUploading ? (
                  <div className="w-full max-w-md">
                    <div className="mb-2 flex items-center justify-between text-sm font-medium">
                      <span className="flex items-center gap-2 text-blue-700">
                        <Loader2 size={16} className="animate-spin" />
                        Analyzing document...
                      </span>
                      <span className="text-slate-600">{progress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <button
                      onClick={() => setFile(null)}
                      className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <X size={18} />
                      Cancel
                    </button>
                    <button
                      onClick={handleUpload}
                      className="flex items-center gap-2 rounded-full bg-blue-700 px-8 py-2.5 text-sm font-bold text-white transition-transform hover:bg-blue-800 shadow-md"
                    >
                      <CheckCircle2 size={18} />
                      Process Document
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedWrapper>
  );
}
