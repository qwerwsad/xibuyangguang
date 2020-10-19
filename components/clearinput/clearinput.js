Component({
    externalClasses: ['input-class', 'icon-class'],

    /**
     * 组件的属性列表
     */
    properties: {
        inputValue: {
              type: String,
              value: '搜索'
         },
         inputIcon: {
              type: String,
              value: 'search.png'
         },
         inputType: {
              type: String,
              value: 'text'
         },
         isPassword: {
              type: Boolean,
              value: false
         },
         confirmType: {
              type: String,
              value: "done"
         }
    },

    /**
     * 组件的初始数据
     */
    data: {
         isClearShow: false,
         inputValue: ''
    },
    onLoad(){
        console.log(this)
    },
    /**
     * 组件的方法列表
     */
    methods: {
        submit(){
            console.log(123)
            if (this.data.inputValue.length > 0) {
                console.log(123)
                var value = this.data.inputValue;
                var detail = {
                    value: value
                }
                this.triggerEvent('inputConfirm', this.data.inputValue);
            }
        },
         inputListener: function (e) {
              var value = e.detail.value;
              var cursor = e.detail.cursor;
              if (value === null || value === undefined || value.length === 0) {
                   this.setData({
                        isClearShow: false
                   });
              } else {
                   this.setData({
                        isClearShow: true
                   });
              }
              this.setData({
                  inputValue: e.detail.value
              })
         },

         inputConfirm: function (e) {
              var value = e.detail.value;
              var detail = {
                   value: value
              }
              this.triggerEvent('inputConfirm', detail);
         },

         clearTap: function () {
              this.setData({
                   isClearShow: false,
                   inputValue: ''
              });
         }
    }
})