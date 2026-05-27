import { useState } from "react";
import { F } from "../constants.js";
import { Icon, Btn, Shell } from "./UI.jsx";

/**
 * ConsentScreen
 * Shows before signup. Parent must:
 *   1. Confirm they are 18+
 *   2. Confirm their child is the intended user
 *   3. Agree to the privacy policy / data terms
 *
 * App stores (Apple + Google) require explicit parental consent before
 * collecting any data on children under 13 (COPPA / GDPR-K).
 */
export default function ConsentScreen({ onAccept, onBack }) {
  const [checked, setChecked] = useState({ age: false, child: false, privacy: false });
  const allChecked = checked.age && checked.child && checked.privacy;

  const toggle = (key) => setChecked(prev => ({ ...prev, [key]: !prev[key] }));

  const items = [
    {
      key: "age",
      label: "I am 18 years of age or older.",
    },
    {
      key: "child",
      label: "I understand Bloomy is designed for children aged 5–11 and I will supervise my child's use of the app.",
    },
    {
      key: "privacy",
      // Replace the href with your real privacy policy URL before shipping
      label: (
        <>
          I have read and agree to the{" "}
          <a
            href="https://bloomy.app/privacy"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#7C4DFF", fontWeight: 700 }}
          >
            Privacy Policy
          </a>
          , including how we collect and store my child's data.
        </>
      ),
    },
  ];

  return (
    <Shell>
      <div style={{ paddingTop: 52 }}>
        <button
          onClick={onBack}
          style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6, marginBottom: 28,
            color: "#9B8DB5", fontFamily: F.b, fontWeight: 600, fontSize: 15,
          }}
        >
          <Icon name="back" size={20} color="#9B8DB5" /> Back
        </button>

        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg,#EDE7F6,#FCE4EC)",
          borderRadius: 24, padding: "28px 24px", marginBottom: 24,
          textAlign: "center",
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "#fff", display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 16px",
            boxShadow: "0 4px 16px rgba(124,77,255,0.15)",
          }}>
            <Icon name="shield" size={32} color="#7C4DFF" />
          </div>
          <h2 style={{ fontFamily: F.h, fontWeight: 900, fontSize: 26, color: "#2D2040", marginBottom: 8 }}>
            A quick word, parent.
          </h2>
          <p style={{ fontFamily: F.b, fontWeight: 500, fontSize: 15, color: "#9B8DB5", lineHeight: 1.7, margin: 0 }}>
            Bloomy stores your child's mood logs, journal entries, and progress.
            Before we create your account, we need your consent.
          </p>
        </div>

        {/* Checkboxes */}
        <div style={{
          background: "#fff", borderRadius: 20,
          boxShadow: "0 2px 18px rgba(124,77,255,0.09)",
          overflow: "hidden", marginBottom: 20,
        }}>
          {items.map(({ key, label }, i) => (
            <button
              key={key}
              onClick={() => toggle(key)}
              style={{
                display: "flex", alignItems: "flex-start", gap: 14,
                padding: "18px 20px",
                borderBottom: i < items.length - 1 ? "1px solid #EEE9FF" : "none",
                background: "none", border: "none", cursor: "pointer",
                width: "100%", textAlign: "left",
              }}
            >
              {/* Custom checkbox */}
              <div style={{
                width: 24, height: 24, borderRadius: 8, flexShrink: 0, marginTop: 1,
                background: checked[key] ? "#7C4DFF" : "#F7F4FF",
                border: `2px solid ${checked[key] ? "#7C4DFF" : "#C5B8E8"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.18s",
              }}>
                {checked[key] && (
                  <svg viewBox="0 0 24 24" width={14} height={14} fill="none"
                    stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </div>
              <p style={{
                fontFamily: F.b, fontWeight: 500, fontSize: 14,
                color: "#2D2040", margin: 0, lineHeight: 1.6,
              }}>
                {label}
              </p>
            </button>
          ))}
        </div>

        {/* Data transparency note */}
        <div style={{
          background: "#F7F4FF", borderRadius: 16, padding: "14px 16px",
          marginBottom: 24, display: "flex", gap: 12, alignItems: "flex-start",
        }}>
          <Icon name="lock" size={18} color="#7C4DFF" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontFamily: F.b, fontWeight: 500, fontSize: 13, color: "#6B5B95", margin: 0, lineHeight: 1.6 }}>
            We never sell your data or show ads. Your child's journal entries and mood logs
            are private and only visible to you and your child.
          </p>
        </div>

        <Btn
          onClick={() => { if (allChecked) onAccept(); }}
          disabled={!allChecked}
          style={{ width: "100%", justifyContent: "center" }}
          icon="check"
        >
          I Agree — Create My Account
        </Btn>

        <p style={{
          fontFamily: F.b, fontWeight: 500, fontSize: 12,
          color: "#9B8DB5", textAlign: "center", marginTop: 14, lineHeight: 1.6,
        }}>
          You can delete your account and all data at any time from Settings.
        </p>
      </div>
    </Shell>
  );
}
