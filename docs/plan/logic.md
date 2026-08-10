# Well Completion Visualizer Logic Specification

This document defines the corrected visual rendering logic for well completion elements based on casing/liner configurations and completion flags.

---

## 1. Terminology & Parameter Glossary

### Flags
* **`ohFlg`**: Open Hole Flag
* **`gpFlg`**: Gravel Pack Flag
* **`perforatedFlg`**: Perforated Interval Flag
* **`lsFlg`**: Liner Screen Flag

### Data Fields
* **`wLnrOdSz`**: Liner Outer Diameter Size
* **`EXAD_GWD_IR_CASING.csgSize`**: Casing/Liner Size attribute
* **`csgType`**: Casing String Type (e.g., `'Liner'`, `'Casing'`)

---

## 2. Global Criteria & Helper Functions

### Liner 7" Size Match Condition (`is7InchLiner`)
A liner record is considered a **7-inch Liner** if either of the following conditions is satisfied:

$$\text{wLnrOdSz} = 7 \quad \lor \quad (\text{EXAD\_GWD\_IR\_CASING.csgSize} = 7 \; \land \; \text{csgType} = \text{'Liner'})$$

---

## 3. Rendering Business Logic Rules

### Rule 1: No Liner Available
* **Condition:** No liner string (`csgType == 'Liner'`) exists in the wellbore geometry dataset.
* **Interval:** 
  $$\text{Start Depth} = \text{Depth}_{\text{Last Casing Shoe}}$$
  $$\text{End Depth} = \text{Total Depth (TD)}$$
* **Action:** For all flags set to `'Y'` (`ohFlg`, `gpFlg`, `perforatedFlg`, `lsFlg`), draw the corresponding completion elements across this interval.

---

### Rule 2: Single Liner Available (1 Liner)
* **Condition:** Exactly one liner exists in the wellbore **AND** `is7InchLiner(liner) == true`.
* **Action:**
  1. **Primary Completion Elements (`ohFlg`, `gpFlg`, `perforatedFlg`):** 
     * Draw each active element (`'Y'`) from the **last casing shoe depth** down to the **liner shoe/end depth**.
  2. **Liner Screen (`lsFlg`):** 
     * If `lsFlg == 'Y'`, draw the Liner Screen element specifically across the liner interval (from **Liner Top/Hanger Depth** to **Liner Shoe Depth**).

---

### Rule 3: Multiple Liners Available (> 1 Liner)
* **Condition:** More than one liner exists in the wellbore dataset.
* **Action:**
  1. Identify the target liner matching `is7InchLiner(liner) == true`.
  2. **Standard Evaluation (7" Liner Match Found):**
     * **Start Depth:** Shoe depth of the casing/liner immediately preceding the target 7" liner string.
     * **End Depth:** Shoe depth (end depth) of the target 7" liner string.
     * **Rendering:** Draw all active completion elements (`'Y'`) across this interval.
  3. **Fallback Condition (No 7" Liner Found):**
     * If multiple liners exist but **none match size 7**, render the available completion elements (`'Y'`) starting from the **shoe depth of the last (deepest) liner** down to **$\max(\text{Current Depth}, \text{Target Depth})$**.

---

## 4. Implementation Reference (Pseudocode)

```javascript
/**
 * Main function to evaluate completion logic and return rendering intervals.
 */
function evaluateCompletionDrawing(wellData) {
  const { casings, flags, currentDepth, targetDepth, totalDepth } = wellData;
  const liners = casings.filter(c => c.csgType === 'Liner');
  const activeFlags = getActiveFlags(flags);

  // Rule 1: No Liner
  if (liners.length === 0) {
    const lastCasingShoe = getLastCasingShoe(casings);
    return renderInterval(activeFlags, lastCasingShoe, totalDepth);
  }

  // Rule 2: Single Liner
  if (liners.length === 1) {
    const liner = liners[0];
    if (is7InchLiner(liner)) {
      const lastCasingShoe = getLastCasingShoe(casings);
      
      // Render main completion flags
      const mainFlags = activeFlags.filter(f => f !== 'lsFlg');
      renderInterval(mainFlags, lastCasingShoe, liner.shoeDepth);

      // Render Liner Screen
      if (flags.lsFlg === 'Y') {
        renderLinerScreen(liner.topDepth, liner.shoeDepth);
      }
    }
    return;
  }

  // Rule 3: Multiple Liners
  if (liners.length > 1) {
    const targetIdx = liners.findIndex(l => is7InchLiner(l));

    if (targetIdx !== -1) {
      const targetLiner = liners[targetIdx];
      const startDepth = (targetIdx === 0) 
        ? getLastCasingShoe(casings) 
        : liners[targetIdx - 1].shoeDepth;
        
      renderInterval(activeFlags, startDepth, targetLiner.shoeDepth);
    } else {
      // Fallback: No 7" liner found among multiple liners
      // Find the deepest liner shoe depth
      const lastLinerShoe = Math.max(...liners.map(l => l.shoeDepth));
      const endDepth = Math.max(currentDepth || 0, targetDepth || 0);

      renderInterval(activeFlags, lastLinerShoe, endDepth);
    }
  }
}

function is7InchLiner(liner) {
  return liner.wLnrOdSz === 7 || (liner.csgSize === 7 && liner.csgType === 'Liner');
}