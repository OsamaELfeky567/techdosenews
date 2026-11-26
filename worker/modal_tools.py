# TD بالعربي tools backend (Modal). All open-source: Tesseract (Apache-2.0), Pillow (HPND), pypdf (BSD), qrcode (BSD).
import io, zipfile
import modal
from fastapi import File, Form, Response, HTTPException
from typing import List

app = modal.App("td-tools")
img = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("tesseract-ocr", "tesseract-ocr-ara", "tesseract-ocr-eng")
    .pip_install("pytesseract", "pillow", "pypdf", "qrcode[pil]", "fastapi[standard]", "python-multipart")
)
CFG = dict(image=img, cpu=1, memory=1024, timeout=120, scaledown_window=60)

def _open(b):
    from PIL import Image, ImageOps
    im = Image.open(io.BytesIO(b))
    return ImageOps.exif_transpose(im)

@app.function(**CFG)
@modal.fastapi_endpoint(method="POST")
def ocr(file: bytes = File(...)):
    import pytesseract
    from PIL import Image, ImageOps
    im = _open(file).convert("L")
    if max(im.size) < 1600:
        k = 1600 / max(im.size)
        im = im.resize((int(im.width * k), int(im.height * k)), Image.LANCZOS)
    im = ImageOps.autocontrast(im)
    text = pytesseract.image_to_string(im, lang="ara+eng", config="--psm 6").strip()
    return Response(content=text.encode("utf-8"), media_type="text/plain; charset=utf-8")

@app.function(**CFG)
@modal.fastapi_endpoint(method="POST")
def compress(file: bytes = File(...), quality: int = Form(70)):
    from PIL import Image
    im = _open(file)
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        bg = Image.new("RGB", im.size, (255, 255, 255))
        bg.paste(im, mask=im.split()[-1])
        im = bg
    else:
        im = im.convert("RGB")
    if max(im.size) > 2560:
        k = 2560 / max(im.size)
        im = im.resize((int(im.width * k), int(im.height * k)), Image.LANCZOS)
    out = io.BytesIO()
    im.save(out, "JPEG", quality=max(30, min(90, quality)), optimize=True, progressive=True)
    data = out.getvalue()
    if len(data) >= len(file):
        data = file if _open(file).format == "JPEG" else data
    return Response(content=data, media_type="image/jpeg",
                    headers={"x-orig-size": str(len(file)), "x-new-size": str(len(data))})

@app.function(**CFG)
@modal.fastapi_endpoint(method="POST")
def imgs2pdf(files: List[bytes] = File(...)):
    ims = []
    for b in files[:30]:
        im = _open(b)
        if im.mode in ("RGBA", "LA", "P"):
            im = im.convert("RGBA")
            from PIL import Image
            bg = Image.new("RGB", im.size, (255, 255, 255)); bg.paste(im, mask=im.split()[-1]); im = bg
        ims.append(im.convert("RGB"))
    if not ims:
        raise HTTPException(400, "no images")
    out = io.BytesIO()
    ims[0].save(out, "PDF", save_all=True, append_images=ims[1:], resolution=150.0)
    return Response(content=out.getvalue(), media_type="application/pdf")

@app.function(**CFG)
@modal.fastapi_endpoint(method="POST")
def merge(files: List[bytes] = File(...)):
    from pypdf import PdfWriter, PdfReader
    w = PdfWriter()
    for b in files[:20]:
        w.append(PdfReader(io.BytesIO(b)))
    out = io.BytesIO(); w.write(out)
    return Response(content=out.getvalue(), media_type="application/pdf")

def _pages(spec, n):
    spec = (spec or "").replace(" ", "").replace("،", ",")
    res = []
    for part in spec.split(","):
        if not part: continue
        if "-" in part:
            a, b = part.split("-", 1)
            a, b = int(a), int(b)
            res += list(range(max(1, a), min(n, b) + 1))
        else:
            p = int(part)
            if 1 <= p <= n: res.append(p)
    return res

@app.function(**CFG)
@modal.fastapi_endpoint(method="POST")
def split(file: bytes = File(...), pages: str = Form("all")):
    from pypdf import PdfWriter, PdfReader
    r = PdfReader(io.BytesIO(file)); n = len(r.pages)
    if pages.strip().lower() in ("all", "each", "كل"):
        z = io.BytesIO()
        with zipfile.ZipFile(z, "w", zipfile.ZIP_DEFLATED) as zf:
            for i in range(min(n, 60)):
                w = PdfWriter(); w.add_page(r.pages[i]); o = io.BytesIO(); w.write(o)
                zf.writestr(f"page-{i+1}.pdf", o.getvalue())
        return Response(content=z.getvalue(), media_type="application/zip", headers={"x-pages": str(n)})
    sel = _pages(pages, n)
    if not sel:
        raise HTTPException(400, f"bad pages (1-{n})")
    w = PdfWriter()
    for p in sel: w.add_page(r.pages[p - 1])
    o = io.BytesIO(); w.write(o)
    return Response(content=o.getvalue(), media_type="application/pdf", headers={"x-pages": str(n)})

@app.function(**CFG)
@modal.fastapi_endpoint(method="POST")
def pdfinfo(file: bytes = File(...)):
    from pypdf import PdfReader
    return {"pages": len(PdfReader(io.BytesIO(file)).pages)}

@app.function(**CFG)
@modal.fastapi_endpoint(method="POST")
def qr(text: str = Form(...)):
    import qrcode
    q = qrcode.QRCode(box_size=12, border=4, error_correction=qrcode.constants.ERROR_CORRECT_M)
    q.add_data(text[:1500]); q.make(fit=True)
    out = io.BytesIO(); q.make_image(fill_color="black", back_color="white").save(out, "PNG")
    return Response(content=out.getvalue(), media_type="image/png")
