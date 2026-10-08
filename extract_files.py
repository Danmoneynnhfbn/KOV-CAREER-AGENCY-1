import re, html, sys, pathlib
src = pathlib.Path(sys.argv[1]).read_text(encoding="utf-8")
dest = pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else ".")
for name, text in re.findall(r'<pre data-file="([^"]+)">(.*?)</pre>', src, re.S):
    if name == "extract_files.py":
        continue
    (dest / name).write_text(html.unescape(text), encoding="utf-8")
    print("wrote", name)
