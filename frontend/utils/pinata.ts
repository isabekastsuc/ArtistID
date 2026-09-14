export type UploadResult = { cid: string; uri: string; gateway: string };

const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/gif", "application/pdf"];

export function validatePortfolioFile(file: File): string | undefined {
  if (file.size === 0) return "the file is empty";
  if (file.size > MAX_BYTES) return "the file is larger than 25 MB";
  if (file.type && !ALLOWED.includes(file.type)) return `unsupported type ${file.type}`;
  return undefined;
}

export async function uploadFileToPinata(parameters: {
  file: File;
  jwt: string;
  onProgress?: (percent: number) => void;
}): Promise<UploadResult> {
  const { file, jwt, onProgress } = parameters;
  const invalid = validatePortfolioFile(file);
  if (invalid) throw new Error(`cannot pin portfolio: ${invalid}`);
  if (!jwt.trim()) throw new Error("a Pinata JWT is required");

  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file, file.name);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.pinata.cloud/pinning/pinFileToIPFS");
    xhr.setRequestHeader("Authorization", `Bearer ${jwt}`);

    xhr.upload.onprogress = (event) => {
      if (!onProgress || !event.lengthComputable) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onreadystatechange = () => {
      if (xhr.readyState !== XMLHttpRequest.DONE) return;
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(`Pinata upload failed: ${xhr.status}`));
        return;
      }
      let json: any;
      try {
        json = JSON.parse(xhr.responseText);
      } catch {
        reject(new Error("Pinata returned a body that is not JSON"));
        return;
      }
      const cid = json && json.IpfsHash;
      if (typeof cid !== "string" || !cid) {
        reject(new Error("Pinata response carried no IpfsHash"));
        return;
      }
      resolve({ cid, uri: `ipfs://${cid}`, gateway: `https://gateway.pinata.cloud/ipfs/${cid}` });
    };

    xhr.onerror = () => reject(new Error("Pinata upload network error"));
    xhr.ontimeout = () => reject(new Error("Pinata upload timed out"));
    xhr.send(formData);
  });
}
