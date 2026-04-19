import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

/**
 * Shared state for syncing highlights between the essay panel and the
 * margin-notes panel. Either side can register a ref for an annotation id;
 * when that id becomes active (hover/focus), the other side scrolls it
 * into view and applies an "active" style.
 */

const AnnotationSyncContext = createContext(null);

export function AnnotationSyncProvider({ children }) {
  const [activeId, setActiveId] = useState(null);
  const essayRefs = useRef(new Map());
  const marginRefs = useRef(new Map());

  const registerEssayRef = useCallback((id, node) => {
    if (node) essayRefs.current.set(id, node);
    else essayRefs.current.delete(id);
  }, []);

  const registerMarginRef = useCallback((id, node) => {
    if (node) marginRefs.current.set(id, node);
    else marginRefs.current.delete(id);
  }, []);

  const focusId = useCallback((id, source) => {
    setActiveId(id);
    if (!id) return;
    // Scroll the sibling side into view.
    const target =
      source === "essay"
        ? marginRefs.current.get(id)
        : essayRefs.current.get(id);
    if (target && typeof target.scrollIntoView === "function") {
      target.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, []);

  const value = useMemo(
    () => ({
      activeId,
      focusId,
      clearActive: () => setActiveId(null),
      registerEssayRef,
      registerMarginRef,
    }),
    [activeId, focusId, registerEssayRef, registerMarginRef]
  );

  return (
    <AnnotationSyncContext.Provider value={value}>
      {children}
    </AnnotationSyncContext.Provider>
  );
}

export function useAnnotationSync() {
  const ctx = useContext(AnnotationSyncContext);
  if (!ctx) {
    throw new Error(
      "useAnnotationSync must be used inside AnnotationSyncProvider"
    );
  }
  return ctx;
}
