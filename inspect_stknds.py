#!/usr/bin/env python3
"""Basic Stick Nodes corpus inspector.

This is intentionally conservative. It does not claim that a file is
application-valid; it only reports container-level properties.
"""

import gzip
import hashlib
import struct
import sys
from pathlib import Path

PREFIX = bytes(range(1, 10))

def inspect(path):
    raw = Path(path).read_bytes()
    print("file:", path)
    print("size:", len(raw))
    print("sha256:", hashlib.sha256(raw).hexdigest())
    print("prefix_ok:", raw[:9] == PREFIX)
    if raw[:9] != PREFIX:
        return
    data = gzip.decompress(raw[9:])
    print("decompressed_size:", len(data))
    if len(data) >= 8:
        version, name_len = struct.unpack(">II", data[:8])
        print("version:", version)
        print("name_length:", name_len)
        if 8 + name_len <= len(data):
            print("project_name:", data[8:8+name_len].decode("utf-8", "replace"))

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("usage: inspect_stknds.py FILE")
        raise SystemExit(2)
    inspect(sys.argv[1])
