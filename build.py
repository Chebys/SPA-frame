import sys, os, json
from base64 import b64encode

config_name = 'build-config.json'

def scan_files(root_dir):
    for root, dirs, files in os.walk(root_dir):
        for filename in files:
            yield os.path.join(root, filename)

def readAsDataUrl(file, mime='application/octet-stream'):
    data = b64encode(file.read())
    return f'data:{mime};base64,{str(data, 'utf8')}'

default_preloads = {
    '.css': 'text',
    '.json': 'json',
    '.bmp': 'bitmap'
}
def build(dirpath, id, name, version=None, author=None, desc=None,
    scripts_path='scripts/', main='scripts/main.js', overrideType={}, preloads={},
    outputpath='test.bin', icon=None):
    '''
    以 scripts_path 为前缀的文件被视作脚本
    icon 指明 dataurl 或 文件名
    '''
    filelist = []
    files = []
    icon_url = icon if icon and icon.startswith('data:') else None
    for fp in scan_files(dirpath):
        file = open(fp, 'rb')
        fname = fp.replace(os.sep, '/')[len(dirpath)+1:]
        #print(fname)
        filemeta = {
            'name': fname,
            'size': os.path.getsize(fp),
            'type': 'script' if fname.endswith('.js') else 'asset'
        }
        if fname in overrideType:
            filemeta['type'] = overrideType[fname]
        if fname==main:
            #filemeta['entrance'] = True
            filemeta['type'] = 'script'
        elif fname==icon:
            icon_url = readAsDataUrl(file)
            continue
        elif fname==config_name:
            continue
        _, ext = os.path.splitext(fname)
        if fname in preloads:
            filemeta['preload'] = preloads[fname]
        elif ext in default_preloads:
            filemeta['preload'] = default_preloads[ext]
        filelist.append(filemeta)
        files.append(file)
    meta = {
        'id': id,
        'name': name,
        'version': version,
        'author': author,
        'desc': desc,
        'files': filelist,
        'require_path': scripts_path[:-1],
        'main': main
    }
    if icon_url:
        meta['icon'] = icon_url
    fout = open(outputpath, 'wb')
    fout.write(json.dumps(meta, ensure_ascii=False).encode('utf8'))
    fout.write(b'\0')
    for file in files:
        fout.write(file.read())

try:
    if len(sys.argv) > 1:
        dirpath = sys.argv[1]
    else:
        dirpath = input('请输入项目路径：\n')
    
    config_file = open(os.path.join(dirpath, config_name), encoding='utf8')
    config = json.load(config_file)
    if 'outputpath' not in config:
        config['outputpath'] = config['id']+'.bin'
    #print(config)
    build(dirpath, **config)
except Exception as e:
    print(e)

input('finish.')