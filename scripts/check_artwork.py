import sys
try:
    import requests
    from PIL import Image
    from io import BytesIO
except Exception as e:
    print('MISSING_LIBS', e)
    print('Run: python -m pip install requests pillow')
    sys.exit(2)

url = 'https://res.cloudinary.com/rahmatrust-m-s/image/upload/w_300/f_auto/q_auto/sanauallah_ronio3.jpg'
print('Fetching:', url)
try:
    r = requests.get(url, stream=True, timeout=15)
    r.raise_for_status()
    data = r.content
    size = len(data)
    cl = r.headers.get('Content-Length')
    img = Image.open(BytesIO(data))
    print('Content-Length header:', cl)
    print('Downloaded bytes:', size)
    print('Image format:', img.format)
    print('Image mode:', img.mode)
    print('Pixel size (width x height):', img.size)
except Exception as e:
    print('ERROR', e)
    sys.exit(1)
