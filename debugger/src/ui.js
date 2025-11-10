function reloadAndDebug(id){
    location.search = '?auto_run=debugger&package='+id
}

let { $n } = require(':spa')
let store = require(':storage')
let projectList

// 更新样式定义
let ctnStyle = {
    padding: '20px',
    border: '1px solid #e1e5e9',
    borderRadius: '12px',
    backgroundColor: 'white',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
}

let sectionTitleStyle = {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '15px',
    paddingBottom: '10px',
    borderBottom: '2px solid #f1f5f9'
}

let buttonStyle = {
    padding: '6px 12px',
    border: 'none',
    borderRadius: '5px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '0.9rem'
}

let primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#4361ee',
    color: 'white'
}

let secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#6c757d',
    color: 'white'
}

let dangerButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#f72585',
    color: 'white'
}

let inputStyle = {
    padding: '12px 15px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.95rem',
    width: '100%',
    boxSizing: 'border-box'
}

function showProjects(list){
    // 创建主容器
    let mainContainer = $n('div', {
        style: {
			maxWidth: '900px',
            margin: '0 auto',
            padding: '20px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            backgroundColor: '#f8fafc',
			boxSizing: 'border-box',
            height: '100vh',
			display: 'flex',
			gap: '10px'
        }
    })
    
    projectList = $n('div', {
		style: {
			flex: 1,
			overflowY: 'auto'
		}
	})
    
    // 项目列表标题
    let projectsHeader = $n('div', {
        style: sectionTitleStyle,
        content: '调试项目列表'
    })
    
    let projectsContainer = $n('div', {
		style: {
			...ctnStyle,
			flex: 1,
			display: 'flex',
			flexDirection: 'column'
		},
        content: [
            projectsHeader,
            projectList
        ]
    })
    
    refreshList(list)
    
    // 添加新项目区域
    let newProjectHeader = $n('div', {
        style: sectionTitleStyle,
        content: '添加新调试项目'
    })
    
    let newCtn = $n('div', {
        style: ctnStyle,
        content: [newProjectHeader]
    })
    
    showConfigScreen(newCtn)
    
    // 组装所有组件
    mainContainer.append(projectsContainer, newCtn)
    Object.assign(document.body.style, {
		width: '900px',
		margin: 'auto',
		backgroundColor: '#f8fafc'
	})
    document.body.append(mainContainer)
}

function refreshList(list){
    if(!list.length){
        projectList.innerHTML = ''
        let emptyState = $n('div', {
            style: {
                textAlign: 'center',
                padding: '40px 20px',
                color: '#64748b'
            },
            content: [
                $n('div', {
                    style: {
                        fontSize: '3rem',
                        marginBottom: '15px'
                    },
                    content: '📁'
                }),
                $n('h3', {
                    style: {
                        fontSize: '1.25rem',
                        marginBottom: '10px',
                        color: '#475569'
                    },
                    content: '暂无调试项目'
                }),
                $n('p', {
                    content: '添加您的第一个项目开始调试'
                })
            ]
        })
        projectList.append(emptyState)
        return
    }
    
    projectList.innerHTML = ''
    
    for(let id of list){
        let li = $n('div', {
            style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                marginBottom: '12px',
                backgroundColor: '#f8fafc',
                transition: 'all 0.2s ease'
            },
            onmouseover(){
                this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
                this.style.transform = 'translateY(-1px)'
            },
            onmouseout(){
                this.style.boxShadow = 'none'
                this.style.transform = 'translateY(0)'
            },
            content: [
				$n('div', {
					content: id,
					style: {
						fontWeight: '600',
						color: '#1e293b',
						fontSize: '1.05rem'
					}
				}),
                $n('div', {
                    style: {
                        display: 'flex',
                        gap: '10px'
                    },
                    content: [
                        $n('button', {
                            style: primaryButtonStyle,
                            onmouseover(){
                                this.style.backgroundColor = '#3a56d4'
                            },
                            onmouseout(){
                                this.style.backgroundColor = '#4361ee'
                            },
                            content: '开始调试',
                            onclick(){
                                reloadAndDebug(id)
                            }
                        }),
                        $n('button', {
                            style: dangerButtonStyle,
                            onmouseover(){
                                this.style.backgroundColor = '#e01a6f'
                            },
                            onmouseout(){
                                this.style.backgroundColor = '#f72585'
                            },
                            content: '移除项目',
                            onclick(){
                                if(confirm(`确定要移除项目 "${id}" 吗？`)) {
                                    store.del(id)
                                    removeFirst(list, id)
                                    refreshList(list)
                                }
                            }
                        })
                    ]
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
    
    // 目录选择区域
    let dirSelector = $n('div', {
        style: {
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            padding: '15px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px dashed #cbd5e1'
        },
        content: [
            $n('button', {
                style: {
                    ...primaryButtonStyle,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                },
                onmouseover(){
                    this.style.backgroundColor = '#3a56d4'
                },
                onmouseout(){
                    this.style.backgroundColor = '#4361ee'
                },
                content: [
                    $n('span', {content: '📁'}),
                    new Text('选择项目目录')
                ],
                async onclick(){
                    try {
                        dirHandle = await showDirectoryPicker()
                        idInput.value = dirText.textContent = dirHandle.name
                        dirText.style.color = '#059669'
                    } catch(err) {
                        console.log('目录选择取消或出错:', err)
                    }
                }
            }),
            dirText = $n('span', {
                style: {
                    color: '#64748b',
                    fontStyle: 'italic'
                },
                content: '未选择目录'
            })
        ]
    })
    
    // 表单字段容器
    let formContainer = $n('div', {
        style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        }
    })
	
	//todo: 
	let btn = $n('button', {
		content: '从 build-config.json 读取配置',
		async onclick(){
			try{
				if(!dirHandle)
					throw new Error('未选择目录')
				let config = await loadJSON(dirHandle, 'build-config.json')
				mainInput.value = config.main
                requireInput.value = config.require_path
                //if(config.preloads)preloadsInput.value = JSON.stringify(config.preloads) 格式？
			}catch(err){
				if(err.name == 'NotFoundError')
					alert('文件不存在')
				else if(err.name == 'SyntaxError')
					alert('文件不合法')
				else
					alert(err)
				console.error(err)
			}
		}
	})
    
    // 表单字段
    let formFields = [
        {label: '项目ID', input: idInput = $n('input', {style: inputStyle}), required: true},
        {label: '主模块路径', input: mainInput = $n('input', {style: inputStyle, value:'src/main.js'})},
        {label: '模块导入路径', input: requireInput = $n('input', {style: inputStyle, value:'src'})}
    ]
    
    // 创建表单字段
    formFields.forEach(field => {
        let fieldContainer = $n('div', {
            content: [
                $n('label', {
                    style: {
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '600',
                        color: '#374151'
                    },
                    content: field.label + (field.required ? ' *' : '')
                }),
                field.input
            ]
        })
        formContainer.append(fieldContainer)
    })
    
    // 预加载规则区域
    let preloadsContainer = $n('div', {
        content: [
            $n('label', {
                style: {
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: '#374151'
                },
                content: '预加载规则'
            }),
            $n('div', {
                style: {
                    fontSize: '0.85rem',
                    color: '#6b7280',
                    marginBottom: '8px'
                },
                content: '指定文件扩展名和对应的加载类型'
            }),
            preloadsInput = $n('textarea', {
                style: {
                    ...inputStyle,
                    minHeight: '120px',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem'
                },
                value: defaultPreloads
            })
        ]
    })
    formContainer.append(preloadsContainer)
    
    // 提交按钮
    let submitButton = $n('button', {
        style: {
            ...primaryButtonStyle,
            padding: '12px 30px',
            fontSize: '1rem',
            marginTop: '10px'
        },
        onmouseover(){
            this.style.backgroundColor = '#3a56d4'
            this.style.transform = 'translateY(-2px)'
        },
        onmouseout(){
            this.style.backgroundColor = '#4361ee'
            this.style.transform = 'translateY(0)'
        },
        content: '添加并调试项目',
        async onclick(){
            try {
                if(!dirHandle)
                    throw new Error('请先选择项目目录')
                
                let id = idInput.value.trim()
                if(!id)
                    throw new Error('请输入项目ID')
                
                let config = {
                    directory: dirHandle,
                    main: mainInput.value,
                    require_path: requireInput.value,
                    preloads: JSON.parse(preloadsInput.value)
                }
                
                await store.set(id, config)
                reloadAndDebug(id)
            } catch(err) {
                alert('错误: ' + err.message)
            }
        }
    })
    
    container.append(
        dirSelector,
        formContainer,
        submitButton
    )
}

return {showProjects}