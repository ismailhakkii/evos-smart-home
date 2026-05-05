from PIL import Image

def remove_background(image_path, output_path, tolerance=30):
    try:
        img = Image.open(image_path)
        img = img.convert("RGBA")
        datas = img.getdata()

        # Assuming top-left pixel is the background color
        bg_color = datas[0]
        
        newData = []
        for item in datas:
            # Check distance
            if (abs(item[0] - bg_color[0]) < tolerance and 
                abs(item[1] - bg_color[1]) < tolerance and 
                abs(item[2] - bg_color[2]) < tolerance):
                newData.append((255, 255, 255, 0)) # Transparent
            else:
                newData.append(item)

        img.putdata(newData)
        img.save(output_path, "PNG")
        print("Success")
    except Exception as e:
        print(f"Error: {e}")

remove_background(r"c:\Users\Dell\evos-smarthome\public\favicon.png", r"c:\Users\Dell\evos-smarthome\public\favicon.png")
