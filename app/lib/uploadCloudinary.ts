export async function uploadParaCloudinary(arquivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Falha ao preparar o arquivo no modo demo."));
    reader.readAsDataURL(arquivo);
  });
}

export async function deletarDoCloudinary(url: string): Promise<void> {
  void url;
}
