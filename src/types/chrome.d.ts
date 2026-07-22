interface ChromeStorageLocal {
  get(keys: string[]): Promise<{ [key: string]: any }>;
  set(items: { [key: string]: any }): Promise<void>;
}

interface ChromeRuntime {
  sendMessage(extensionId: string, message: any): void;
}

interface ChromeDeclarativeNetRequest {
  getDynamicRules(): Promise<any[]>;
  updateDynamicRules(options: { removeRuleIds?: number[]; addRules?: any[] }): Promise<void>;
}

interface Chrome {
  runtime: ChromeRuntime;
  storage: { local: ChromeStorageLocal };
  declarativeNetRequest: ChromeDeclarativeNetRequest;
}

declare global {
  interface Window {
    chrome?: Chrome;
  }
}

export {};