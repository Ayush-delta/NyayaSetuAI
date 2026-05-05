// src/services/api.ts — mock implementations so frontend runs offline

function getAuthHeader() {
  try {
    const token = localStorage.getItem("nyaya_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch (e) {
    return {};
  }
}

export const uploadFile = async (file: File) => {
  // Mock extraction: return filename and placeholder text after delay
  await new Promise((r) => setTimeout(r, 700));
  return {
    filename: file.name,
    text: `Extracted text from ${file.name} (mock). Replace this with your content.`,
  };
};

export const queryAI = async (query: string) => {
  // Mock AI response
  await new Promise((r) => setTimeout(r, 400));
  return {
    query,
    answer: `Mock answer to: ${query}`,
  };
};

export const saveTextDocument = async (title: string, filename: string, content: string) => {
  // Mock save: store in localStorage documents list
  await new Promise((r) => setTimeout(r, 400));
  try {
    const existing = JSON.parse(localStorage.getItem("nyaya_docs" ) || "[]");
    const doc = { id: Date.now(), title, filename, content, savedAt: new Date().toISOString() };
    existing.push(doc);
    localStorage.setItem("nyaya_docs", JSON.stringify(existing));
    return doc;
  } catch (e) {
    throw new Error("Save failed (mock)");
  }
};