"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type ClassificationKey = "public" | "official" | "confidential" | "strict"

interface LevelDef {
  key: ClassificationKey
  label: string
  stamp: string
  who: string
  /** CSS color token this level maps to. */
  token: string
  /** Shield-family icon path(s). */
  path: string
  /** Solid banner uses light text (else dark). */
  lightText: boolean
}

/** The four confidentiality levels, least → most restrictive. */
export const CLASSIFICATION_LEVELS: Record<ClassificationKey, LevelDef> = {
  public: {
    key: "public",
    label: "Public",
    stamp: "Available to the Public",
    who: "Anyone",
    token: "var(--chart-5)",
    path: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    lightText: true,
  },
  official: {
    key: "official",
    label: "For Official Use Only",
    stamp: "For Official Use Only",
    who: "Designated staff",
    token: "var(--primary)",
    path: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 22V2"/>',
    lightText: true,
  },
  confidential: {
    key: "confidential",
    label: "Confidential",
    stamp: "Confidential",
    who: "Need-to-know",
    token: "var(--chart-3)",
    path: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
    lightText: false,
  },
  strict: {
    key: "strict",
    label: "Strictly Confidential",
    stamp: "Strictly Confidential",
    who: "Strict need-to-know",
    token: "var(--destructive)",
    path: '<circle cx="12" cy="16" r="1"/><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    lightText: true,
  },
}

function Shield({ path, size = 13 }: { path: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none" }} dangerouslySetInnerHTML={{ __html: path }} />
  )
}

export interface ClassificationBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  level: ClassificationKey
  size?: number
}

/** A pill badge marking a record's confidentiality level. */
export function ClassificationBadge({ level, size = 13, className, style, ...props }: ClassificationBadgeProps) {
  const l = CLASSIFICATION_LEVELS[level] ?? CLASSIFICATION_LEVELS.public
  return (
    <span
      className={cn(className)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        padding: "0.22rem 0.55rem 0.22rem 0.45rem",
        borderRadius: 999,
        fontSize: "0.68rem",
        fontWeight: 700,
        letterSpacing: "0.02em",
        textTransform: "uppercase",
        lineHeight: 1,
        color: l.token,
        border: `1px solid color-mix(in oklab, ${l.token} 45%, transparent)`,
        background: `color-mix(in oklab, ${l.token} 12%, var(--card))`,
        ...style,
      }}
      {...props}
    >
      <Shield path={l.path} size={size} />
      {l.label}
    </span>
  )
}

export interface ClassificationBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  level: ClassificationKey
  /** Show the "Handling: …" audience on the right. Default true. */
  showHandling?: boolean
}

/** A full-width banner — the stamp a classified document carries top and bottom. */
export function ClassificationBanner({ level, showHandling = true, className, style, ...props }: ClassificationBannerProps) {
  const l = CLASSIFICATION_LEVELS[level] ?? CLASSIFICATION_LEVELS.public
  const solid = level !== "public"
  return (
    <div
      role="note"
      aria-label={`Classification: ${l.stamp}`}
      className={cn(className)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.42rem 0.9rem",
        borderRadius: "calc(var(--radius) - 1px)",
        fontSize: "0.7rem",
        fontWeight: 700,
        letterSpacing: "0.09em",
        textTransform: "uppercase",
        color: solid ? (l.lightText ? "#fff" : "#1a1a1a") : l.token,
        background: solid ? l.token : `color-mix(in oklab, ${l.token} 13%, var(--card))`,
        border: solid ? "none" : `1px solid color-mix(in oklab, ${l.token} 40%, transparent)`,
        ...style,
      }}
      {...props}
    >
      <Shield path={l.path} size={14} />
      <span>{l.stamp}</span>
      {showHandling ? (
        <span style={{ marginLeft: "auto", fontWeight: 600, letterSpacing: "0.01em", textTransform: "none", opacity: 0.9, fontSize: "0.68rem" }}>Handling: {l.who}</span>
      ) : null}
    </div>
  )
}
