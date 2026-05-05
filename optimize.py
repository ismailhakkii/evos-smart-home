import os
from PIL import Image

def optimize_image(input_path, output_path):
    if not os.path.exists(input_path):
        print(f"Skipping {input_path}, not found.")
        return
    try:
        img = Image.open(input_path)
        img.save(output_path, "webp", quality=85)
        old_size = os.path.getsize(input_path)
        new_size = os.path.getsize(output_path)
        print(f"Optimized {os.path.basename(input_path)}: {old_size//1024}KB -> {new_size//1024}KB")
    except Exception as e:
        print(f"Failed {input_path}: {e}")

public_dir = r"c:\Users\Dell\evos-smarthome\public"
files = ["evos_logo.png", "evos_hero.png", "hero-bg.png"]

for f in files:
    in_path = os.path.join(public_dir, f)
    out_path = os.path.join(public_dir, f.replace(".png", ".webp"))
    optimize_image(in_path, out_path)
