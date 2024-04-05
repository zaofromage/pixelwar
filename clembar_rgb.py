from PIL import Image

im = Image.open(r"clembar.png")
px = im.load()
output = []
for i in range(im.size[0]):
    output.append([])
    for j in range(im.size[1]):
        output[i].append(px[i, j])
    