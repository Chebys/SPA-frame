let store = require(':storage')

async function startDebug(id){
	let {$n, runApp, loadBlob} = require(':spa')
	let fs = require('fs')
	
	let config = await store.get(id)
	if(!config)
		throw new Error('config not found')
	let hd = config.directory
	if(await hd.queryPermission() != 'granted'){
		let button = $n('button', {
			content: '请授予访问权限',
			style: {
				fontSize: '18px'
			}
		})
		document.body.append(button)
		await new Promise((resolve, reject)=>{
			button.onclick = ()=>hd.requestPermission()
				.then(res=>{
					console.log('permission:', res)
					if(res=='granted')
						resolve()
					else
						reject(new Error('未授予权限，无法访问'))
				})
		})
	}
	document.body.textContent = '正在加载……'
	let assets = Object.create(null),
		scripts = Object.create(null)
	for await(let [name, h] of fs.scanFiles(hd)){
		let file = await h.getFile(),
			ext = fs.ext(name),
			isScript = ext=='.js'
		if(isScript){
			scripts[name] = await file.text()
		}else{
			assets[name] = ext in config.preloads
				? await loadBlob(file, config.preloads[ext])
				: file
		}
	}
	let app = {
		id,
		name: 'debug-'+id,
		assets,
		scripts,
		main: config.main,
		require_path: config.require_path
	}
	console.log('runApp', app)
	runApp(app)
}

let params = new URLSearchParams(location.search)
let packageId = params.get('package')

if(packageId && !globalThis.DEBUGGING){
	globalThis.DEBUGGING = true
	startDebug(packageId)//.catch(alert)
}else{
	let ui = require('ui')
	store.keys().then(ui.showProjects)
}
