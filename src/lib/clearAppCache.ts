import { invoke } from "@tauri-apps/api/core";
import { cacheStorageService } from "./storage";
import { queryClient } from "./client";
import { clearHeroCache } from "./hooks/useHomePageData";

export const clearAppCache = async (): Promise<void> => {
  cacheStorageService.clearAll();
  queryClient.clear();
  clearHeroCache();
  try {
    await invoke("clear_seek_thumbnails");
  } catch (error) {
    console.warn("Failed to clear seek thumbnails disk cache:", error);
  }
};

