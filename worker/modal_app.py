import modal
from fastapi import File, Response

app = modal.App("td-bg-removal")

img = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install("rembg[cpu]==2.0.56", "onnxruntime", "fastapi[standard]", "python-multipart", "pillow")
    .run_commands('python -c "from rembg import new_session; new_session(\'u2net\')"')
)

_session = None

def get_session():
    global _session
    if _session is None:
        from rembg import new_session
        _session = new_session("u2net")
    return _session

@app.function(image=img, cpu=2, memory=2048, timeout=120)
@modal.fastapi_endpoint(method="POST", docs=True)
def remove(file: bytes = File(...)):
    from rembg import remove as rembg_remove
    from fastapi import Response
    out = rembg_remove(file, session=get_session())
    return Response(content=out, media_type="image/png")

@app.function(image=img)
@modal.fastapi_endpoint(method="GET")
def health():
    return {"ok": True, "model": "u2net"}
