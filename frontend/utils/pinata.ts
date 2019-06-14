export async function uploadFileToPinata(parameters: {
  file: File;
  jwt: string;
  onProgress?: (percent: number) => void;
}): Promise<{ cid: string; uri: string; gateway: string }> {
  const { file, jwt, onProgress } = parameters;

  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file, file.name);

