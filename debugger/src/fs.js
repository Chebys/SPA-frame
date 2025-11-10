function ext(name){
	let pos = name.lastIndexOf('.')
	if(pos<0)return ''
	return name.slice(pos)
}
async function getFile(dir, path){
	let parts = path.split('/')
	while(parts.length > 1){
		let root = parts.shift()
		dir = await dir.getDirectoryHandle(root)
	}
	let h = await dir.getFileHandle(parts[0])
	return h.getFile()
}
async loadJSON(dir, path){
	let file = await getFile(dir, path)
	let str = await file.text()
	return JSON.parse(str)
}
async function* scanFiles(dir, prefix=''){
	for await(let [name, hd] of dir.entries()){
		if(hd.kind=='directory')
			yield* scanFiles(hd, prefix+hd.name+'/')
		else
			yield [prefix+name, await hd.getFile()]
	}
}

return {ext, getFile, loadJSON, scanFiles}