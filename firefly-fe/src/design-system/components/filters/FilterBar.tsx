import React from "react";
import { useTranslation } from "react-i18next";
import { Select } from "../inputs/Inputs";

export interface FilterBarProps {
  city?: string;
  onCityChange?: React.ChangeEventHandler<HTMLSelectElement>;
  topic?: string;
  onTopicChange?: React.ChangeEventHandler<HTMLSelectElement>;
  sort?: "new" | "popular";
  onSortChange?: (value: "new" | "popular") => void;
  cities?: string[];
  topics?: string[];
  showSort?: boolean;
}

/**
 * FilterBar — city + topic + sort controls used atop the public feed and Lost Fireflies list.
 */
export function FilterBar({
  city, onCityChange,
  topic, onTopicChange,
  sort, onSortChange,
  cities,
  topics,
  showSort = true,
}: FilterBarProps) {
  const { t } = useTranslation();
  const cityList = cities ?? (t("cities", { returnObjects: true }) as string[]);
  const topicList = topics ?? (t("topics", { returnObjects: true }) as string[]);

  return (
    <div style={{
      display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center",
      padding: "var(--space-4) 0", fontFamily: "var(--font-ui)",
    }}>
      <div style={{ minWidth: 180 }}>
        <Select
          value={city}
          onChange={onCityChange}
          placeholder={t("filter.allCities")}
          options={cityList.map((c) => ({ value: c, label: c }))}
          aria-label={t("filter.city")}
        />
      </div>
      <div style={{ minWidth: 200 }}>
        <Select
          value={topic}
          onChange={onTopicChange}
          placeholder={t("filter.allTopics")}
          options={topicList.map((option) => ({ value: option, label: option }))}
          aria-label={t("filter.topic")}
        />
      </div>
      {showSort && (
        <div style={{ display: "flex", marginLeft: "auto", background: "var(--bg-sunken)", borderRadius: "var(--radius-pill)", padding: 3, gap: 2 }}>
          {(["new", "popular"] as const).map((v) => (
            <button key={v} onClick={() => onSortChange?.(v)} style={{
              border: "none", cursor: "pointer", padding: "7px 16px", borderRadius: "var(--radius-pill)",
              fontSize: 13, fontWeight: 600,
              background: sort === v ? "var(--bg-surface)" : "transparent",
              color: sort === v ? "var(--text-primary)" : "var(--text-tertiary)",
              boxShadow: sort === v ? "var(--shadow-sm)" : "none",
            }}>{v === "new" ? t("filter.sortNew") : t("filter.sortPopular")}</button>
          ))}
        </div>
      )}
    </div>
  );
}
