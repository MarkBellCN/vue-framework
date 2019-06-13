<template>
    <div>
		<script :id="ueId" type="text/plain"></script>
    </div>
</template>
<script>
export default {
    name: "UE",
    props: {
			ueId: {
				type: String,
				default: 'ueId'
			},
			defaultMsg: {
				type: String,
				default: ''
			},
			config: {
				type: Object
			},
			isOnly: {
				type: Boolean
			}
    },
    data() {
		return {
			ueId: `J_ueditorBox_${new Date().getTime()}`,
			editor: null,
			content: null
		};
    },
    mounted() {
			this.init();
    },
    methods: {
			init() {
				const _this = this;
				this.editor = UE.getEditor(this.ueId, this.config); // 初始化UE
				this.editor.addListener("ready", function () {
					let msg = '';
					if (typeof _this.defaultMsg !== 'undefined' && _this.defaultMsg) {
						msg = _this.defaultMsg;
					}
					_this.editor.setContent(msg); // 确保UE加载完成后，放入内容。
				});
			},
			getUEContent() {
				// 获取内容方法
				return this.editor.getContent();
			},
			getUEContentTxt() {
				// 获取内容方法
				return this.editor.getContentTxt();
			}
			},
		destroyed() {
			this.editor.destroy();
		},
    watch: {
			defaultMsg(newval) {
				try {
					this.editor.setContent(newval);
				} catch (error) {}
			}
    }
};

</script>

