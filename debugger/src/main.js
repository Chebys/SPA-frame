let store = require(':idb').storage('packages')

async function startDebug(id){
	let {$n, loadBlob} = require(':spa')
	let {runApp} = require(':debug')
	let fs = require('fs')
	
	let config = await store.get(id)
	if(!config)
		throw new Error('config not found')
	let hd = config.directory
	if(await hd.queryPermission() != 'granted'){
		let {promise, resolve, reject} = Promise.withResolvers()
		let button = $n('button', {
			content: '请授予访问权限',
			style: {
				fontSize: '18px'
			},
			async onclick(){
				let res = await hd.requestPermission()
				console.log('permission:', res)
				if(res=='granted')
					resolve()
				else
					reject(new Error('未授予权限，无法访问'))
			}
		})
		document.body.append(button)
		await promise
	}
	document.body.textContent = '正在加载……'
	let assets = Object.create(null),
		scripts = Object.create(null),
		preloads = config.preloads || Object.create(null),
		overrideType = config.overrideType || Object.create(null)
	for await(let [name, file] of fs.scanFiles(hd)){
		let ext = fs.ext(name),
			isScript = name in overrideType ? overrideType[name]=='script' : ext=='.js'
		if(isScript){
			scripts[name] = await file.text()
		}else{
			assets[name] = name in preloads ? await loadBlob(file, preloads[name])
				: ext in preloads ? await loadBlob(file, preloads[ext])
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
