/**
 * AutoTranslator — runtime DOM translator for non-NL locales.
 *
 * Approach:
 *   1. On mount + on locale change + on route change + on DOM mutation,
 *      walk all text nodes and `[alt]`/`[placeholder]`/`[title]` attributes.
 *   2. Skip script/style/code/noscript and anything with `data-no-translate`
 *      or inside `<input>`/`<textarea>` values.
 *   3. Batch unique unseen Dutch strings, call the auto-translate edge
 *      function, then patch the DOM in-place.
 *   4. In-memory + localStorage cache so we don't re-call for strings
 *      we've already translated in this session.
 *
 * Only active when i18n.language !== "nl".
 */
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const SKIP_TAGS = new Set([
  "SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "SVG", "PATH",
  "TEXTAREA", "INPUT", "SELECT", "OPTION",
]);

const ATTR_TARGETS = ["alt", "placeholder", "title", "aria-label"] as const;

const NL_HINT = /[a-zà-ÿ]/i; // contains at least one letter
const NUMERIC_ONLY = /^[\s\d.,€$%+\-/:]+$/;

function shouldSkipNode(node: Node): boolean {
  let el: HTMLElement | null = node.parentElement;
  while (el) {
    if (SKIP_TAGS.has(el.tagName)) return true;
    if (el.hasAttribute("data-no-translate")) return true;
    if (el.getAttribute("translate") === "no") return true;
    if (el.isContentEditable) return true;
    el = el.parentElement;
  }
  return false;
}

const BRAND_BLOCKLIST = /\bhuurbaasje\b/i;

function shouldTranslateString(s: string): boolean {
  const trimmed = s.trim();
  if (trimmed.length < 2) return false;
  if (trimmed.length > 1000) return false;
  if (!NL_HINT.test(trimmed)) return false;
  if (NUMERIC_ONLY.test(trimmed)) return false;
  if (BRAND_BLOCKLIST.test(trimmed)) return false;
  return true;
}

type Job = { text: string; apply: (translated: string) => void };

function collectJobs(root: Node, seen: Set<string>): Job[] {
  const jobs: Job[] = [];

  // Text nodes
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (shouldSkipNode(node)) return NodeFilter.FILTER_REJECT;
      const text = node.nodeValue ?? "";
      if (!shouldTranslateString(text)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  } as NodeFilter);

  let n: Node | null;
  while ((n = walker.nextNode())) {
    const textNode = n as Text;
    const original = textNode.nodeValue ?? "";
    const trimmed = original.trim();
    if (!trimmed) continue;
    const key = `T:${trimmed}`;
    if (seen.has(key)) continue;
    seen.add(key);
    jobs.push({
      text: trimmed,
      apply: (translated) => {
        // Preserve leading/trailing whitespace
        const leading = original.match(/^\s*/)?.[0] ?? "";
        const trailing = original.match(/\s*$/)?.[0] ?? "";
        textNode.nodeValue = leading + translated + trailing;
      },
    });
  }

  // Attribute targets
  if (root instanceof Element || root === document.body) {
    const scope = root instanceof Element ? root : document.body;
    const elements = scope.querySelectorAll<HTMLElement>("[alt],[placeholder],[title],[aria-label]");
    elements.forEach((el) => {
      if (el.hasAttribute("data-no-translate") || el.getAttribute("translate") === "no") return;
      for (const attr of ATTR_TARGETS) {
        const val = el.getAttribute(attr);
        if (!val || !shouldTranslateString(val)) continue;
        const trimmed = val.trim();
        const key = `A:${attr}:${trimmed}`;
        if (seen.has(key)) continue;
        seen.add(key);
        jobs.push({
          text: trimmed,
          apply: (translated) => el.setAttribute(attr, translated),
        });
      }
    });

    // <title>
    if (document.title && shouldTranslateString(document.title)) {
      const t = document.title.trim();
      const key = `TITLE:${t}`;
      if (!seen.has(key)) {
        seen.add(key);
        jobs.push({
          text: t,
          apply: (translated) => { document.title = translated; },
        });
      }
    }
    // meta description
    const metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (metaDesc && shouldTranslateString(metaDesc.content)) {
      const t = metaDesc.content.trim();
      const key = `META:desc:${t}`;
      if (!seen.has(key)) {
        seen.add(key);
        jobs.push({
          text: t,
          apply: (translated) => { metaDesc.content = translated; },
        });
      }
    }
  }

  return jobs;
}

const CACHE_PREFIX = "huurbaasje_tx_";

function loadCache(lang: string): Map<string, string> {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + lang);
    if (!raw) return new Map();
    const obj = JSON.parse(raw);
    return new Map(Object.entries(obj));
  } catch {
    return new Map();
  }
}

function persistCache(lang: string, cache: Map<string, string>) {
  try {
    const obj: Record<string, string> = {};
    cache.forEach((v, k) => { obj[k] = v; });
    localStorage.setItem(CACHE_PREFIX + lang, JSON.stringify(obj));
  } catch {
    /* quota */
  }
}

export default function AutoTranslator() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const cacheRef = useRef<Map<string, string>>(new Map());
  const seenRef = useRef<Set<string>>(new Set());
  const cacheLangRef = useRef<string>("");
  const inFlightRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const lang = (i18n.language || "nl").slice(0, 2);
    if (lang === "nl" || !["en", "de", "fr"].includes(lang)) {
      return;
    }

    // Re-init cache when language changes
    if (cacheLangRef.current !== lang) {
      cacheLangRef.current = lang;
      cacheRef.current = loadCache(lang);
      seenRef.current = new Set();
      inFlightRef.current = new Set();
    }

    let cancelled = false;
    let pending: Job[] = [];
    let scheduled = false;

    const flush = async () => {
      scheduled = false;
      if (cancelled) return;
      const batch = pending;
      pending = [];
      if (batch.length === 0) return;

      // Apply from cache immediately + collect misses
      const misses: Job[] = [];
      for (const job of batch) {
        const cached = cacheRef.current.get(job.text);
        if (cached) {
          job.apply(cached);
        } else if (inFlightRef.current.has(job.text)) {
          // already requested; remember to apply once it lands
          misses.push(job);
        } else {
          inFlightRef.current.add(job.text);
          misses.push(job);
        }
      }

      if (misses.length === 0) return;

      // Dedupe texts for the request
      const uniqueTexts = Array.from(new Set(misses.map((m) => m.text)));

      try {
        const { data, error } = await supabase.functions.invoke("auto-translate", {
          body: { texts: uniqueTexts, lang },
        });
        if (cancelled || error) return;
        const translations = (data?.translations ?? {}) as Record<string, string>;

        for (const [src, tgt] of Object.entries(translations)) {
          cacheRef.current.set(src, tgt);
        }
        for (const job of misses) {
          const tgt = translations[job.text] ?? cacheRef.current.get(job.text);
          if (tgt) job.apply(tgt);
          inFlightRef.current.delete(job.text);
        }
        persistCache(lang, cacheRef.current);
      } catch (e) {
        console.warn("AutoTranslator request failed", e);
        for (const job of misses) inFlightRef.current.delete(job.text);
      }
    };

    const scheduleScan = (root: Node = document.body) => {
      const jobs = collectJobs(root, seenRef.current);
      if (jobs.length > 0) pending.push(...jobs);
      if (!scheduled) {
        scheduled = true;
        setTimeout(flush, 80);
      }
    };

    // Initial scan
    scheduleScan(document.body);

    // Observe DOM changes (route swaps, lazy content, lists)
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "characterData" && m.target.parentNode) {
          // text content changed -> reset seen for this exact string and rescan parent
          scheduleScan(m.target.parentNode);
        } else {
          m.addedNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE) {
              scheduleScan(node);
            }
          });
        }
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [i18n.language, location.pathname]);

  return null;
}
