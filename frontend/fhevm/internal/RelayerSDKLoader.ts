import { SDK_CDN_URL } from "./constants";

export class RelayerSDKLoader {
  public load(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).relayerSDK) return resolve();
      const script = document.createElement("script");
      script.src = SDK_CDN_URL;
      script.type = "text/javascript";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Relayer SDK"));
      document.head.appendChild(script);
    });
  }
}



