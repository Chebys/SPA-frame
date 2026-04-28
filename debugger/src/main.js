let store = require(':idb').storage('packages')
let params = new URLSearchParams(location.search)
let packageId = params.get('package')

if(packageId && !globalThis.DEBUGGING){
	let startDebug = require('debugging')
	globalThis.DEBUGGING = true
	store.get(packageId).then(config => {
		if(!config)
			throw new Error('config not found')
		startDebug(packageId, config)
	})
	//startDebug(packageId)//.catch(alert)
}else{
	let ui = require('ui')
	store.keys().then(ui.showProjects)
}
