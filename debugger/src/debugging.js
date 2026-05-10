let {$n, loadBlob} = require(':spa')
let {runApp} = require(':debug')
let fs = require('fs')

function toRegMap(dict){
	let map = new Map
	for(let pt in dict){
		let str = pt
			.replace(/[.+^${}()|[\]\\]/g, '\\$&')   // 转义正则特殊字符
			.replaceAll('**', '.+')                 // ** -> 匹配多级
			.replaceAll('*', '[^/]+')               // * -> 匹配单级
		let re = new RegExp(`^${str}$`)
		map.set(re, dict[pt])
	}
	return map
}
async function startDebug(id, config){
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
				/* else
					reject(new Error('未授予权限，无法访问')) */
			}
		})
		document.body.append(button)
		await promise
	}
	document.body.textContent = '正在加载……'
	let assets = Object.create(null),
		scripts = Object.create(null),
		preloads = config.preloads || Object.create(null),
		typeMap = toRegMap(config.overrideType||{})
	function getOverrideType(name){
		for(let [re, type] of typeMap.entries()){
			if(re.test(name))
				return type
		}
	}
	for await(let [name, file] of fs.scanFiles(hd)){
		let ext = fs.ext(name),
			type = getOverrideType(name),
			isScript = type ? type=='script' : ext=='.js'
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

return startDebug