//start string helper
function StringHelper () {
}

StringHelper.isEmpty = function (str) {
    str = $.trim(str)
    return str === undefined || str == null || str == ''
}
StringHelper.isNotEmpty = function (str) {
    return !StringHelper.isEmpty(str)
}
//end string helper

//start array helper
function ObjectHelper () {
}

ObjectHelper.isEmpty = function (o) {
    return o === undefined || o == null || !(o instanceof Object)
}
ObjectHelper.isNotEmpty = function (o) {
    return o !== undefined && o != null && (o instanceof Object)
}
ObjectHelper.hasProperty = function (o, property) {
    return ObjectHelper.isNotEmpty(o) && o.hasOwnProperty(property)
}
//end array helper

//start number helper
function NumberHelper () {
}

NumberHelper.isNumber = function (value) {
    if (StringHelper.isEmpty(value)) {
        return false
    }
    let n = Number(value)
    return !isNaN(n)
}
//end number helper

//start of string format
//两种调用方式
// var template1="我是{0}，今年{1}了";
// var template2="我是{name}，今年{age}了";
// var result1=template1.format("loogn",22);
// var result2=template2.format({name:"loogn",age:22});
//两个结果都是"我是loogn，今年22了"
// var a = "I Love {0}, and You Love {1},Where are {0}! {4}";
// alert(String.format(a, "You","Me"));
// alert(a.format("You","Me"));
String.prototype.format = function (args) {
    var result = this
    if (arguments.length > 0) {
        if (arguments.length == 1 && typeof (args) == 'object') {
            for (var key in args) {
                if (args[key] != undefined) {
                    var reg = new RegExp('({' + key + '})', 'g')
                    result = result.replace(reg, args[key])
                }
            }
        } else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] != undefined) {
                    //var reg = new RegExp("({[" + i + "]})", "g");//这个在索引大于9时会有问题，谢谢何以笙箫的指出
                    var reg = new RegExp('({)' + i + '(})', 'g')
                    result = result.replace(reg, arguments[i])
                }
            }
        }
    }
    return result
}
String.format = function () {
    if (arguments.length == 0) return null

    var str = arguments[0]
    for (var i = 1; i < arguments.length; i++) {
        var re = new RegExp('\\{' + (i - 1) + '\\}', 'gm')
        str = str.replace(re, arguments[i])
    }
    return str
}
//end of string format

//start timer helper
function TimerHelper () {
}

/**
 * 定时器，注意如果循环n秒，其实n秒（第一秒）是不会有的，直接从n-1秒开始，一直到0结束
 * @param handler callable 回调接口，每一次都会回调，handler会传入当前剩余的秒数
 * @param seconds integer 剩余秒数
 */
TimerHelper.setInterval = function (handler, seconds) {
    window.setTimeout(function () {
        --seconds
        if (seconds > 0) {
            handler(seconds)
            TimerHelper.setInterval(handler, seconds)
        } else {
            handler(seconds)
        }
    }, 1000)
}
//end timer helper

//start api helper
function ApiHelper (title = null, message = null, timeout = 10000) {
    this.title = title
    this.message = message
    this.successRedirectSecond = 3
    this.timeout = timeout
    this.timeoutHandler = 0
    this.dialog;

    this.init = function () {
        let options = {
            title: MyMessageHelper.issueRequest,
            message: MyMessageHelper.waitForServerReplyAndHoldOn,
            closable: false,
            buttons: [{
                id: 'dialog-btn-1',
                icon: 'glyphicon glyphicon-ok',
                label: MyMessageHelper.waitingForResponse,
                cssClass: 'btn-primary',
                action: function (dialogRef) {
                    dialogRef.close()
                }
            }]
        }
        if (!StringHelper.isEmpty(this.title)) {
            options.title = this.title
        }
        if (!StringHelper.isEmpty(this.message)) {
            options.message = this.message
        }
        this.dialog = new BootstrapDialog(options)
        this.dialog.realize()
        this.button = this.dialog.getButton('dialog-btn-1')
    }
    this.init()
    this.setTimeout = function (timeout) {
        this.timeout = timeout;
        return this;
    }

    /**
     * 加载中，菊花转
     * @see ApiHelper.simpleDealResponse
     * */
    this.loading = function () {
        this.button.spin()
        this.dialog.enableButtons(false)
        this.dialog.open()
        let that = this
        if (this.timeout > 0) {
            this.timeoutHandler = setTimeout(function () {
                that.error('操作超时')
            }, this.timeout)
        }
    }
    /**
     * 统一处理返回结果
     * @see ApiHelper.simpleDealResponse
     * @param result
     * @param success_msg
     * @param redirect_url
     * @param timeout
     */
    this.deal = function (result, success_msg, redirect_url, timeout) {
        if (result.code === 200) {
            this.success(result, success_msg, redirect_url)
        } else {
            this.error(result.msg, timeout)
        }
    }
    /**
     * 统一处理返回结果
     * @see ApiHelper.simpleDealResponse
     * @param result
     * @param callable
     * @param timeout
     */
    this.finish = function (result, callable = null, timeout = 3000) {
        if (result.code === 200) {
            this.success2(result, callable)
        } else {
            this.error(result.msg, timeout)
        }
    }
    /**
     * 错误消息时显示，可以点击或者自动关闭
     * @see ApiHelper.simpleDealResponse
     * @param errorMessage
     * @param timeout
     */
    this.error = function (errorMessage, timeout) {
        this.button.stopSpin()
        this.button.html('<span class="bootstrap-dialog-button-icon glyphicon glyphicon-remove" style=""></span>' + MyMessageHelper.close)
        this.dialog.setMessage(errorMessage)
        this.dialog.enableButtons(true)
        let dialogTemp = this.dialog
        if (StringHelper.isEmpty(timeout)) {
            timeout = 3000
        }
        clearTimeout(this.timeoutHandler)
        setTimeout(function () {
            dialogTemp.close()
        }, timeout)
    }
    /**
     * 成功消息时显示，3秒倒计时跳转到目标地址
     * @see ApiHelper.simpleDealResponse
     * @param result
     * @param success_msg
     * @param redirect_url
     */
    this.success = function (result, success_msg, redirect_url) {
        function successDeal () {
            if (StringHelper.isEmpty(redirect_url)) {
                location.reload()
            } else {
                location.href = redirect_url
            }
        }

        this.button.stopSpin()
        this.button.html('<span class="bootstrap-dialog-button-icon glyphicon glyphicon-ok" style=""></span>' + MyMessageHelper.confirm)
        this.button.click(function () {
            successDeal()
        })
        this.dialog.setMessage(success_msg.format(this.successRedirectSecond))
        this.dialog.enableButtons(true)
        let dialogTemp = this.dialog
        clearTimeout(this.timeoutHandler)
        TimerHelper.setInterval(function (second) {
            dialogTemp.setMessage(success_msg.format(second))
            if (second === 0) {
                successDeal()
            }
        }, this.successRedirectSecond)
    }
    /**
     * 成功消息时显示，3秒倒计时跳转到目标地址
     * @see ApiHelper.simpleDealResponse
     * @param result
     * @param callable
     */
    this.success2 = function (result, callable) {
        if (callable === null) {
            callable = function (result) {}
        }
        this.button.stopSpin()
        this.button.html('<span class="bootstrap-dialog-button-icon glyphicon glyphicon-ok" style=""></span>' + MyMessageHelper.confirm)
        let executeCallable = false
        this.button.click(function () {
            if (!executeCallable) {
                executeCallable = true
                callable(result)
            }
        })
        this.dialog.setMessage(result.msg.format(this.successRedirectSecond))
        this.dialog.enableButtons(true)
        let dialogTemp = this.dialog
        clearTimeout(this.timeoutHandler)
        TimerHelper.setInterval(function (second) {
            dialogTemp.setMessage(result.msg.format(second))
            if (second === 0) {
                if (!executeCallable) {
                    executeCallable = true
                    callable(result)
                }
            }
        }, this.successRedirectSecond)
    }
}

/**
 * 简单接口结果处理：失败对话框显示错误2秒，成功则显示消息3秒，并跳转至目标地址
 * @param result API请求的结果
 * @param success_msg 成功消息提示，需要带一个参数以显示倒计时，如:投资成功,{0}秒后跳转至会员中心
 * @param redirect_url 成功跳转的URL地址
 */
ApiHelper.simpleDealResponse = function (result, success_msg, redirect_url) {
    if (result.code === 200) {
        let label = StringHelper.isEmpty(redirect_url) ? MyMessageHelper.refresh : MyMessageHelper.redirect
        BootstrapDialog.show({
            title: MyMessageHelper.success, message: success_msg.format(3), buttons: [{
                icon: 'glyphicon glyphicon-ok', label: label, cssClass: 'btn-primary', action: function (dialogRef) {
                    dialogRef.close()
                    if (StringHelper.isEmpty(redirect_url)) {
                        location.reload()
                    } else {
                        location.href = redirect_url
                    }
                }
            }], onshown: function (dialogRef) {
                TimerHelper.setInterval(function (second) {
                    dialogRef.setMessage(success_msg.format(second))
                    if (second === 0) {
                        if (StringHelper.isEmpty(redirect_url)) {
                            location.reload()
                        } else {
                            location.href = redirect_url
                        }
                    }
                }, 3)
            }
        })
    } else {
        BootstrapDialog.alert({
            title: MyMessageHelper.error,
            message: result.msg,
            type: BootstrapDialog.TYPE_DANGER
        })
    }
}
/**
 * 标准接口结果处理：通过回调函数处理
 * @param result API请求的结果
 * @param onSuccess 成功
 * @param onFailure 成功
 */
ApiHelper.dealResponse = function (result, onSuccess, onFailure) {
    if (result.code === 200) {
        onSuccess(result)
    } else {
        if (onFailure === undefined || onFailure == null || onFailure === '') {
            BootstrapDialog.alert({
                title: MyMessageHelper.error, message: result.msg, type: BootstrapDialog.TYPE_DANGER
            })
        } else {
            onFailure(result)
        }
    }
}
//end api helper

//start ajax helper
function AjaxHelper () {
}

/**
 * 必须指定setting.type
 * @param url
 * @param params
 * @param success
 * @param settings
 */
AjaxHelper.ajax = function (url, params, success, settings) {
    settings.success = success
    settings.data = params
    settings.xhrFields = { withCredentials: true }
    settings.crossDomain = true
    settings.dataType = 'json'
    $.ajax(url, settings)
}
AjaxHelper.get = function (url, params, success, settings) {
    if (ObjectHelper.isEmpty(settings)) {
        settings = {}
    }
    settings.type = 'GET'
    AjaxHelper.ajax(url, params, success, settings)
}
AjaxHelper.post = function (url, params, success, settings) {
    if (ObjectHelper.isEmpty(settings)) {
        settings = {}
    }
    settings.type = 'POST'
    AjaxHelper.ajax(url, params, success, settings)
}
//end ajax helper
//start dialog helper
function DialogHelper () {
}

/**
 * 简单跳转提示对话框
 * @param msg string 提示消息
 * @param redirect_url string 跳转URL
 * @param btnOKLabel string 确认按钮提示文字
 */
DialogHelper.simpleDialog = function (msg, redirect_url = '', btnOKLabel = '确认') {
    BootstrapDialog.confirm({
        title: MyMessageHelper.message,
        message: msg,
        closable: true,
        draggable: true,
        btnOKLabel: StringHelper.isEmpty(redirect_url) ? btnOKLabel : MyMessageHelper.redirect,
        callback: function (result) {
            if (result) {
                if (StringHelper.isEmpty(redirect_url)) {
                    location.reload()
                } else {
                    location.href = redirect_url
                }
            }
        },
    })
}
/**
 * 自动关闭提示窗
 * @param options
 * @param timeout
 */
DialogHelper.autoclose = function (options, timeout = 2000) {
    options.onshown = function (dialogRef) {
        setTimeout(function () {
            dialogRef.close()
        }, timeout)
    }
    options.closable = true
    BootstrapDialog.show(options)
}
/**
 * 简单提示
 * @param options string|object
 * @param timeout
 */
DialogHelper.hint = function (options, timeout = 2000) {
    if (typeof options === 'string') {
        options = { message: options }
    }
    options.onshown = function (dialogRef) {
        setTimeout(function () {
            dialogRef.close()
        }, timeout)
    }
    options.closable = true
    let dialog = new BootstrapDialog(options)
    dialog.realize()
    dialog.getModalHeader().hide()
    dialog.getModalFooter().hide()
    dialog.getModalBody().css('text-align', 'center')
    dialog.open()
}
//end dialog helper

//start LocalMap
function LocalMap (name = '_') {
    this.name = name
    this.init()
}

LocalMap.prototype.init = function () {
    Object.keys(localStorage).forEach(item => {
        if (item.startsWith(this.name)) {
            this.hasItem(item.replace(this.name, ''))
        }
    })
}
LocalMap.prototype.setItem = function (key, value, time) {
    if (value === undefined) value = null
    const _key = this.name + key
    const _value = { value }
    time && (_value.time = time * 1000 + new Date().getTime())
    localStorage.setItem(_key, JSON.stringify(_value))
}
LocalMap.prototype.getItem = function (key) {
    if (this.hasItem(key)) {
        return JSON.parse(localStorage.getItem(this.name + key)).value
    }
    return null
}
LocalMap.prototype.removeItem = function (key) {
    localStorage.removeItem(this.name + key)
}
LocalMap.prototype.clear = function () {
    Object.keys(localStorage).forEach(item => {
        if (item.startsWith(this.name)) {
            localStorage.removeItem(item)
        }
    })
}
LocalMap.prototype.lenght = function () {
    return Object.keys(localStorage).length
}
LocalMap.prototype.hasItem = function (key) {
    const _key = this.name + key
    if (localStorage.getItem(_key)) {
        const _time = JSON.parse(localStorage.getItem(_key)).time
        if (new Date().getTime() > _time) {
            localStorage.removeItem(_key)
            return false
        }
        return true
    } else {
        return false
    }
}
LocalMap.prototype.keys = function () {
    let keys = []
    Object.keys(localStorage).forEach(item => {
        let _key = item.replace(this.name, '')
        if (item.startsWith(this.name) && this.hasItem(_key)) {
            keys.push(_key)
        }
    })
    return keys
}
LocalMap.prototype.values = function () {
    let values = {}
    Object.keys(localStorage).forEach(item => {
        let _key = item.replace(this.name, '')
        if (item.startsWith(this.name) && this.hasItem(_key)) {
            values[_key] = this.getItem(_key)
        }
    })
    return values
}
//end LocalMap
//start tab
function TabHelper (header = 'tab_nav', content = 'tab_content') {
    $('.' + header + ' div').click(function () {
        if ($(this).hasClass('tab_active')) {
            return
        }
        $('.' + header + ' div.tab_active').removeClass('tab_active')
        $(this).addClass('tab_active')
        let key = $(this).data('key')
        $('.' + content + ' > div').hide().filter('.' + key).show()
    })
}
//end tab