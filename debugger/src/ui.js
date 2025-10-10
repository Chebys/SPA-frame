function reloadAndDebug(id){
	location.search = '?auto_run=debugger&package='+id
}

let { $n } = require(':spa')
let store = new IDBStorage('SPA-frame', 'debugger')
let projectList

let ctnStyle = {
	padding: '5px',
	border: '1px solid grey'
}
function showProjects(list){
	projectList = $n('div', {style: ctnStyle})
	refreshList(list)
	
	let newCtn = $n('div', {
		style: ctnStyle,
		content: [$n('h4', {content: '添加调试项目'})]
	})
	showConfigScreen(newCtn)
	document.body.append(projectList, newCtn)
}
function refreshList(list){
	if(!list.length){
		projectList.textContent = '暂无项目'
		return
	}
	projectList.innerHTML = ''
	for(let id of list){
		let li = $n('div', {
			content: [
				new Text(id),
				$n('button', {
					content: '调试',
					onclick(){
						reloadAndDebug(id)
					}
				}),
				$n('button', {
					content: '移除',
					onclick(){
						store.del(id)
						removeFirst(list, id)
						refreshList(list)
					}
				})
			]
		})
		projectList.append(li)
	}
}
function removeFirst(arr, val){
	let pos = arr.indexOf(val)
	if(pos >= 0)
		arr.splice(pos, 1)
	return arr
}

let defaultPreloads = `{
".css": "text",
".json": "json",
".bmp": "bitmap"
}`
function showConfigScreen(container){
	let dirHandle = null
	let idInput, dirText, mainInput, requireInput, preloadsInput
	
	container.append(
	$n('div', {
		content: [
			$n('button', {
				content: '选择项目目录',
				async onclick(){
					dirHandle = await showDirectoryPicker()
					idInput.value = dirText.textContent = dirHandle.name
				}
			}),
			dirText = $n('span', {content: '未选择'})
		]
	}),
	$n('div', {
		content: [
			new Text('项目id'),
			idInput = $n('input')
		]
	}),
	$n('div', {
		content: [
			new Text('主模块路径'),
			mainInput = $n('input', {value:'src/main.js'})
		]
	}),
	$n('div', {
		content: [
			new Text('模块导入路径'),
			requireInput = $n('input', {value:'src'})
		]
	}),
	$n('div', {
		content: [
			$n('div', {content:'预加载规则'}),
			preloadsInput = $n('textarea', {value:defaultPreloads})
		]
	}),
	$n('button', {
		content: '确定',
		style: {display: 'block'},
		async onclick(){
			//console.log(dirHandle)
			try{
				if(!dirHandle)
					throw new Error('未选择目录')
				let id = idInput.value
				let config = {
					directory: dirHandle,
					main: mainInput.value,
					require_path: requireInput.value,
					preloads: JSON.parse(preloadsInput.value)
				}
				await store.set(id, config)
				reloadAndDebug(id)
			}catch(err){
				alert(err)
			}
		}
	}))
}

return {showProjects}