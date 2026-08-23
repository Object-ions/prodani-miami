"""Minimal PNG cropper. sips' --cropOffset is center-relative and clamps in ways
that produced blank and mis-registered slices, so this does the crop explicitly:
parse IHDR, inflate IDAT, undo per-row filters, slice columns, re-filter, deflate."""
import zlib, struct, sys

def read_png(path):
    d = open(path, 'rb').read()
    assert d[:8] == b'\x89PNG\r\n\x1a\n', 'not a png'
    pos, idat, meta = 8, b'', {}
    while pos < len(d):
        ln = struct.unpack('>I', d[pos:pos+4])[0]
        typ = d[pos+4:pos+8]
        body = d[pos+8:pos+8+ln]
        if typ == b'IHDR':
            w, h, bd, ct, comp, filt, il = struct.unpack('>IIBBBBB', body)
            meta = dict(w=w, h=h, bd=bd, ct=ct, interlace=il)
        elif typ == b'IDAT':
            idat += body
        elif typ == b'IEND':
            break
        pos += 12 + ln
    assert meta['bd'] == 8, f"need 8-bit, got {meta['bd']}"
    assert meta['interlace'] == 0, 'interlaced png unsupported'
    ch = {0:1, 2:3, 3:1, 4:2, 6:4}[meta['ct']]
    raw = zlib.decompress(idat)
    w, h = meta['w'], meta['h']
    stride = w * ch
    out, prev = [], bytearray(stride)
    i = 0
    for _ in range(h):
        f = raw[i]; i += 1
        line = bytearray(raw[i:i+stride]); i += stride
        for x in range(stride):
            a = line[x-ch] if x >= ch else 0
            b = prev[x]
            c = prev[x-ch] if x >= ch else 0
            if f == 1:   line[x] = (line[x] + a) & 255
            elif f == 2: line[x] = (line[x] + b) & 255
            elif f == 3: line[x] = (line[x] + (a+b)//2) & 255
            elif f == 4:
                p = a + b - c
                pa, pb, pc = abs(p-a), abs(p-b), abs(p-c)
                pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[x] = (line[x] + pr) & 255
        out.append(bytes(line)); prev = line
    return out, w, h, ch, meta['ct']

def write_png(path, rows, w, h, ch, ct):
    raw = b''.join(b'\x00' + r for r in rows)
    def chunk(t, b):
        return struct.pack('>I', len(b)) + t + b + struct.pack('>I', zlib.crc32(t + b) & 0xffffffff)
    png = (b'\x89PNG\r\n\x1a\n'
           + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, ct, 0, 0, 0))
           + chunk(b'IDAT', zlib.compress(raw, 9))
           + chunk(b'IEND', b''))
    open(path, 'wb').write(png)

if __name__ == '__main__':
    src, x0, y0, cw, chh, dst = sys.argv[1], *map(int, sys.argv[2:6]), sys.argv[6]
    rows, w, h, ch, ct = read_png(src)
    cw = min(cw, w - x0); chh = min(chh, h - y0)
    sliced = [r[(x0+i)*ch:(x0+i+cw)*ch] if False else r[x0*ch:(x0+cw)*ch]
              for r in rows[y0:y0+chh]]
    write_png(dst, sliced, cw, chh, ch, ct)
    print(f'  {dst}  {cw}x{chh}  from x={x0} y={y0}')
