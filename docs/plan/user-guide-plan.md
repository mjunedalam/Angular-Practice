Act as a Principal Technical Writer and Software Documentation Specialist. 

Your task is to write a complete, comprehensive, and highly detailed Application User Guide formatted specifically for a Microsoft Word document (.docx). 

---

### 1. CRITICAL EXCLUSION RULE (TOP PRIORITY)
- DO NOT include, document, or mention the "Well Planning" module or feature anywhere in this user guide.
- Treat "Well Planning" as completely hidden/disabled for all user roles.
- In all UI navigation descriptions, step-by-step guides, and screenshot placement instructions, explicitly hide/omit "Well Planning" from the side navigation bar, header menus, and user permissions matrices.

---

### 2. APPLICATION DETAILS
- Application Name: [Insert App Name, e.g., Enterprise Energy & Operations Portal]
- Application Type: [e.g., Web Application, Desktop Client, Mobile App]
- Primary Purpose: [Insert brief 1-2 sentence description of what the app does]
- Target Audience: [End Users, System Administrators, Managers, Field Operators, etc.]

---

### 3. ROLES & PERMISSIONS MATRIX
Include all step-by-step instructions customized for the following User Roles (ensure "Well Planning" is completely excluded across all roles):
1. [Role 1: e.g., Standard Operator / User]
2. [Role 2: e.g., Supervisor / Approver]
3. [Role 3: e.g., System Administrator]
(Note: Highlight role-specific permissions, restricted action buttons, disabled state hover texts/tooltips, and permission variations throughout.)

---

### 4. DOCUMENT STRUCTURE & FORMATTING INSTRUCTIONS

To ensure the document looks ready for publication in Microsoft Word:

1. Document Structure:
   - Title Page / Cover Information (Document Title, Subtitle, Version, Date, Author)
   - Executive Summary & Scope (State that documentation reflects current system configuration, omitting Well Planning)
   - Table of Contents (Placeholder with heading levels 1-3 mapped)
   - Getting Started & Onboarding (System Requirements, Login, Navigation Overview — with 'Well Planning' removed from side nav)
   - Role-Based Access Matrix (Table format)
   - Core Modules & Functionality (Granular, step-by-step with inline tooltip explanations)
   - Troubleshooting & FAQs
   - Appendix / Glossary of Terms

2. Step-by-Step Writing Rules (With Inline Tooltip Explanations):
   - For every allowed module, feature, and sub-feature, break down instructions into numbered sequential steps.
   - **Inline Tooltip & Field Helper Integration:** Do NOT create a separate section for tooltips. Instead, wherever a tooltip, hover card, info icon (i), or helper text exists on a form field, button, or metric, explain its exact text and purpose directly within that action step (e.g., "Hover over the **Status** icon to view the tooltip: *'Pending Manager Approval'*").
   - Use clear formatting conventions:
     - **Bold** for UI elements, menu items, and button labels (e.g., Click **Save Changes**).
     - *Italic* for user inputs or specific field names (e.g., In the *Operational Threshold* field...).
     - `Monospace` or Callout Boxes for paths, URLs, keyboard shortcuts, or exact tooltip copy.
   - Include **Prerequisites** (e.g., "Must have Supervisor rights") and **Expected Outcomes** (e.g., "Result: The status badge changes to 'Approved' and a success banner displays") for every major task.

3. Screenshot Placeholders:
   - Insert explicit, formatted visual placeholders for screenshots in MS Word.
   - Ensure side navigation screenshots explicitly exclude "Well Planning".
   - Include active tooltip/hover states directly in the screenshot placement notes whenever relevant.
   - Format placeholders like this:
     📸 [SCREENSHOT PLACEHOLDER]: Screen showing the Main Form with the mouse hovering over the 'Risk Index' info icon (i), displaying the tooltip popover text. Side navigation must show Modules A, B, and C with Well Planning hidden. Annotations needed: Red bounding box around the active tooltip.

---

### 5. MODULE-BY-MODULE BREAKDOWN TO COVER

Provide comprehensive, exhaustive step-by-step documentation for the following modules (excluding Well Planning), capturing all inline tooltips, hover card text, and helper info directly within each step:

- Module 1: Authentication, Onboarding & User Profile Management
  - Login, MFA setup, password reset, navigation overview, profile settings, dynamic role-based UI variations, and inline UI guidance tooltips.
  
- Module 2: [Insert Module Name, e.g., Field Operations & Assets]
  - Creation, editing, real-time status indicators (including inline explanations of status badge hover tooltips), dynamic field validations, and action logs.

- Module 3: [Insert Module Name, e.g., Data Entry & Form Processing]
  - Form navigation, field-level helper tooltips `(i)`, required vs. optional fields, error state tooltips on hover, saving drafts, and bulk uploads via CSV/Excel.

- Module 4: [Insert Module Name, e.g., Analytics, Metrics & Reporting]
  - Dashboard widget hover tooltips, interactive chart hover cards, data filtering, scheduled automated reports, and multi-format exports (PDF/Excel).

- Module 5: [Insert Module Name, e.g., System Administration & Audit Logs]
  - User provisioning, permission toggles (explaining permission-level info tooltips directly at each toggle), audit log filtering, and system alert configurations.

---

### 6. TONAL & QUALITY REQUIREMENTS
- Tone: Professional, clear, authoritative, and easy to follow.
- Depth: Exhaustive detail. Do not summarize or skip UI fields, hover text, or secondary workflows.
- Word Formatting Hints: Use native MS Word headings (Heading 1, Heading 2, Heading 3), standard tables with bold header rows, styled Note/Tip callout boxes, and clear divider lines between major sections.