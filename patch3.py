with open("components/PayrollProcessor.tsx", "r") as f:
    content = f.read()

# Add getBase64ImageFromUrl helper at the top if it's missing
if "async function getBase64ImageFromUrl" not in content and "const getBase64ImageFromUrl" not in content:
    func = """
const getBase64ImageFromUrl = async (url: string): Promise<string> => {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
"""
    content = content.replace("const LOGO_URL", func + "\nconst LOGO_URL")
    with open("components/PayrollProcessor.tsx", "w") as f:
        f.write(content)
    print("Added getBase64ImageFromUrl")
else:
    print("getBase64ImageFromUrl already present")
