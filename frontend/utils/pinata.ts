export async function uploadFileToPinata(parameters: {
  file: File;
  jwt: string;
  onProgress?: (percent: number) => void;
}): Promise<{ cid: string; uri: string; gateway: string }> {
  const { file, jwt, onProgress } = parameters;

  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file, file.name);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.pinata.cloud/pinning/pinFileToIPFS");
    xhr.setRequestHeader("Authorization", `Bearer ${jwt}`);

    xhr.upload.onprogress = (event) => {
      if (!onProgress || !event.lengthComputable) return;
      const percent = Math.round((event.loaded / event.total) * 100);
      onProgress(percent);
    };

    xhr.onreadystatechange = () => {
