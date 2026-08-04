### Task: Redesign Step 5 in Angular Feature Component

**Target Path:** `@src/app/features/well-planning/well-ir/`

#### Requirements

1. **Step Title Update:**
   - Rename "Hydrology and testing" to **"Estimated Hydrology"**.

2. **Test Type Toggle Control:**
   - Convert the "Test Type" selection into a **button-based toggle group** (e.g., using Angular Material `mat-button-toggle-group` or custom styled buttons).
   - Toggle options: `FLOW` and `PUMP`.

3. **Dynamic Form Fields (Reactive Forms):**
   - **When Test Type = `FLOW`**, render the following fields:
     - Aquifer
     - SIWHP (psi)
     - Estimated TDS (ppm)
     - Estimated Rate (GPM)
     - H2S (ppm)
   - **When Test Type = `PUMP`**, render the following fields:
     - Aquifer
     - Estimated TDS (ppm)
     - Estimated Rate (GPM)
     - H2S (ppm)
     - Estimated Water Level (ft)
     - Estimated Pump Depth (ft)

4. **Animations & UX:**
   - Integrate **GSAP (`gsap`)** to handle smooth entrance/exit transitions when toggling between `FLOW` and `PUMP` view fields.
   - Ensure form control validation states are updated dynamically (`addControl` / `removeControl` or conditional validation) when switching modes.

5. **Deliverables:**
   - Updated Component TypeScript (`.ts`) file with reactive form logic and GSAP transition handlers.
   - Updated Template HTML (`.html`) with button toggle group and animated containers.
   - Updated Component Styles (`.scss` / `.css`).