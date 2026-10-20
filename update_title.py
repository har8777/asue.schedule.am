import os
import json

package_path = "package.json"

if os.path.exists(package_path):
    with open(package_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if "scripts" not in data:
        data["scripts"] = {}

    data["scripts"]["predeploy"] = "npm run build"
    data["scripts"]["deploy"] = "gh-pages -d dist"

    with open(package_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("✅ File package.json aggiornato con i comandi di deploy!")
else:
    print("❌ Errore: file package.json non trovato.")