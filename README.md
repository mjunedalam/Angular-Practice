// ── colour tokens ───────────────────────────────────────────────
$active-bg:      #87ceeb;   // sky blue  (remark exists)
$active-border:  #38bdf8;
$active-text:    #0c4a6e;
$active-dot:     #0369a1;

$inactive-bg:    #ffffff;   // white     (no remark / disabled)
$inactive-border:#e2e8f0;
$inactive-text:  #94a3b8;
$inactive-dot:   #cbd5e1;
// ────────────────────────────────────────────────────────────────

.log-indicator {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 6px;
  padding: 10px 14px 12px;
  background: #ffffff;
  border: 1px solid #0000001f;
  border-radius: 11px;

  &__title {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1.1px;
    text-transform: uppercase;
    color: #64748b;
  }

  &__buttons {
    display: flex;
    gap: 6px;
  }
}

.log-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 6px 10px;
  border-radius: 20px;
  border: 1.5px solid $inactive-border;
  background: $inactive-bg;
  color: $inactive-text;
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.4px;
  cursor: default;
  transition: background 0.18s ease, border-color 0.18s ease,
              color 0.18s ease, box-shadow 0.18s ease;

  &__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: $inactive-dot;
    flex-shrink: 0;
    transition: background 0.18s, box-shadow 0.18s;
  }

  // ── active state: remark exists ─────────────────────────────
  &--active {
    background: $active-bg;
    border-color: $active-border;
    color: $active-text;
    cursor: default;
    box-shadow: 0 2px 8px rgba(135, 206, 235, 0.50);

    .log-btn__dot {
      background: $active-dot;
      box-shadow: 0 0 5px rgba($active-dot, 0.6);
    }
  }

  // ── inactive state: no remark / disabled ────────────────────
  &--inactive {
    background: $inactive-bg;
    border-color: $inactive-border;
    color: $inactive-text;
    opacity: 0.55;
  }

  &:disabled {
    cursor: not-allowed;
  }
}
