function ext(name){
	let pos = name.lastIndexOf('.')
	if(pos<0)return ''
	return name.slice(pos)
}
async function* scanFiles(dir, prefix=''){
	for await(let [name, hd] of dir.entries()){
		if(hd.kind=='directory')
			yield* scanFiles(hd, prefix+hd.name+'/')
		else
			yield [prefix+name, hd]
	}
}

return {ext, scanFiles}