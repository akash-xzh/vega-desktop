import React, { useEffect } from "react";
import {
  LuX as X,
  LuServer as Server,
  LuDownload as Download,
  LuCircleAlert as AlertCircle,
  LuLoaderCircle as Loader,
} from "react-icons/lu";
import { Stream } from "../../lib/providers/types";
import { FocusableButton } from "../layout/FocusableButton";
import {
  useFocusable,
  FocusContext,
} from "@noriginmedia/norigin-spatial-navigation-react";
import { settingsStorage } from "../../lib/storage";
import "../DownloadServerDialog.css";

interface BatchQualityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  streams: Stream[];
  episodeTitle: string;
  selectedCount: number;
  onSelect: (stream: Stream) => void;
  loading?: boolean;
  error?: string | null;
}

export const BatchQualityDialog: React.FC<BatchQualityDialogProps> = ({
  isOpen,
  onClose,
  streams,
  episodeTitle,
  selectedCount,
  onSelect,
  loading = false,
  error,
}) => {
  const tvMode = settingsStorage.isTvModeEnabled();
  const {
    ref: focusRef,
    focusKey,
    focusSelf,
  } = useFocusable({
    focusable: tvMode && isOpen,
    trackChildren: true,
    isFocusBoundary: true,
  });

  useEffect(() => {
    if (isOpen && tvMode) {
      setTimeout(() => {
        focusSelf();
      }, 100);
    }
  }, [isOpen, tvMode, focusSelf]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <FocusContext.Provider value={focusKey}>
      <div className="download-dialog-overlay" onClick={onClose}>
        <div
          className="download-dialog-content"
          role="dialog"
          aria-modal="true"
          aria-labelledby="batch-download-dialog-title"
          onClick={(e) => e.stopPropagation()}
          ref={focusRef as any}
        >
          <div className="download-dialog-header">
            <div>
              <h2 id="batch-download-dialog-title" className="headline-sm">
                Choose Batch Download Quality
              </h2>
              <p className="text-muted body-sm mt-xs">
                {selectedCount} episode{selectedCount > 1 ? "s" : ""} selected • Available qualities from {episodeTitle}
              </p>
            </div>
            <FocusableButton
              className="icon-btn"
              onClick={onClose}
              aria-label="Close quality options"
            >
              <X size={24} />
            </FocusableButton>
          </div>

          <div className="download-dialog-body">
            {loading ? (
              <div className="empty-state-dialog">
                <Loader size={68} className="spin text-primary mb-sm" />
                <p className="text-muted body-sm">Loading available qualities from first episode...</p>
              </div>
            ) : error || streams.length === 0 ? (
              <div className="empty-state-dialog">
                <AlertCircle size={40} className="mb-sm text-yellow-500" />
                <p>{error || "No downloadable streams found for the first episode."}</p>
              </div>
            ) : (
              <div className="stream-list">
                {streams.map((stream, idx) => {
                  const qualityDisplay = stream.quality
                    ? `${stream.quality}`
                    : stream.type?.toUpperCase() || "UNKNOWN";
                  const rawTags: string[] = Array.isArray(stream.tags)
                    ? stream.tags
                    : typeof stream.tag === "string"
                    ? [stream.tag]
                    : [];
                  const tags = rawTags
                    .map((t) => (typeof t === "string" ? t.trim() : ""))
                    .filter(
                      (t) =>
                        Boolean(t) &&
                        t.toLowerCase() !== stream.quality?.trim().toLowerCase(),
                    );

                  return (
                    <FocusableButton
                      key={idx}
                      className="stream-item"
                      onClick={() => {
                        onSelect(stream);
                        onClose();
                      }}
                    >
                      <div className="stream-icon">
                        <Server size={20} />
                      </div>
                      <div className="stream-details">
                        <h4
                          className="label-lg"
                          title={stream.server || "Default Server"}
                        >
                          {stream.server || "Default Server"}
                        </h4>
                        <div className="stream-badges">
                          <span className="quality-badge">{qualityDisplay}</span>
                          {tags.map((t, tIdx) => (
                            <span key={tIdx} className="quality-badge tag-badge">
                              {t.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="stream-action">
                        <Download size={20} />
                      </div>
                    </FocusableButton>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </FocusContext.Provider>
  );
};

