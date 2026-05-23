# **NyayaSetuAI Frontend ⚖️💻**

The interactive Next.js (App Router) user interface for the NyayaSetuAI Legal Intelligence Platform. It provides government officers and admins with tools to upload judgments, verify AI-extracted compliance metrics, and monitor action plans.

---

## 🚀 Key Features

*   **Intelligent Upload Portal:** Simple drag-and-drop interface for legal judgment PDFs (supporting both digital text and scanned copies).
*   **Split-Screen Verification Dashboard:** Shows the extracted legal text alongside the AI-structured action items. Admins can verify, edit, or reject the extracted data.
*   **Decision Support Dashboard:** Tracks department-wise compliance, status updates (Pending, In Progress, Approved), appeal risk metrics, and priority deadlines.
*   **Role-Based Access Control (RBAC):** Restricts interface accessibility based on roles:
    *   **Admin:** Complete dashboard management, verification flow approval, and user system configuration.
    *   **Officer:** View-only access to assigned compliance items, deadline calendars, and task workflows.

---

## 🛠️ Tech Stack

*   **Framework:** Next.js 15+ (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS (Modern aesthetics, glassmorphic card designs, fully responsive layouts)
*   **Icons:** Lucide React
*   **Animations:** Framer Motion (micro-animations on card hovers and page transitions)
*   **State & Authentication:** JWT tokens stored securely via `localStorage` and synchronized with cookies for Next.js Middleware route protection.

---

## ⚙️ Local Setup

### 📋 Prerequisites
*   **Node.js v18+**
*   **npm** or **yarn**

### 🔧 Step-by-Step Installation

1.  **Navigate to the frontend folder:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    We recommend using `--legacy-peer-deps` to ensure dependency compatibility:
    ```bash
    npm install --legacy-peer-deps
    ```

3.  **Configure Environment Variables:**
    Create a `.env.local` file in the root of the `frontend` directory:
    ```env
    # Points to the FastAPI backend API service
    NEXT_PUBLIC_API_URL="http://127.0.0.1:8000"
    ```

4.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

5.  **Open in Browser:**
    Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🌐 Live Demo & Credentials

The live system is deployed at: **[nyaya-setu-ai.vercel.app](https://nyaya-setu-ai.vercel.app)**

For testing and evaluation, you can log in using these preset credentials:

| Role | Username | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | Upload PDFs, verify AI extractions, configure settings |
| **Officer** | `officer` | `officer123` | View approved action plans and monitor deadlines |

---

## 📸 Interface Preview

### Home Screen
![Home](../docs/screenshots/front.png)

### Upload Portal
![Upload](../docs/screenshots/upload.png)

### Action Plan & Decision Support
![Dashboard](../docs/screenshots/dashboard.png)

### Admin Control Center
![Admin](../docs/screenshots/admin.png)
