(function () {
    if (window._PagSeguroDirectPayment) {
        return
    }
    function onDocumentReady(callback) {
        var eventName = document.addEventListener ? "DOMContentLoaded" : "onreadystatechange";
        if ("complete" === document.readyState || "loading" !== document.readyState && !document.attachEvent) {
            callback();
            return
        }
        document[document.addEventListener ? "addEventListener" : "attachEvent"](eventName, function () {
            if ("DOMContentLoaded" == eventName || "complete" === document.readyState) {
                callback();
                document[document.removeEventListener ? "removeEventListener" : "detachEvent"](eventName, arguments.callee, false)
            }
        }, false)
    }

    var pagsegurosession, PagSeguro = PagSeguro || function () {
            }, gateway = document.createElement("iframe"), styleNode = document.createElement("style"),
        styleSheets = [".directpaymentgateway {position:absolute; width:0px; height:0px; display:none;}"].join("");
    gateway.setAttribute("src", "https://sandbox.pagseguro.uol.com.br/checkout/direct-payment/i-ck.html");
    gateway.setAttribute("width", "1px");
    gateway.setAttribute("height", "1px");
    gateway.setAttribute("id", "directpaymentgateway");
    gateway.setAttribute("class", "directpaymentgateway");
    gateway.setAttribute("allowtransparency", "true");
    gateway.setAttribute("frameborder", "0");
    PagSeguro.DirectPayment = function (config) {
        var _that = this;
        this.gateway = gateway;
        this.ready = false;
        this.mediator = false;
        this.queue = [];
        this.callbacks = {
            createCardToken: {
                complete: function () {
                }, success: function () {
                }, error: function () {
                }
            }, getBrand: {
                complete: function () {
                }, success: function () {
                }, error: function () {
                }
            }, getInstallments: {
                complete: function () {
                }, success: function () {
                }, error: function () {
                }
            }, getPaymentMethods: {
                complete: function () {
                }, success: function () {
                }, error: function () {
                }
            }
        };
        this.dnahash;
        this.init();
        window._PagSeguroDirectPayment = this
    };
    PagSeguro.DirectPayment.prototype = {
        constructor: PagSeguro.DirectPayment, init: function () {
            var _that = this;
            onDocumentReady(function () {
                document.getElementsByTagName("body")[0].appendChild(gateway);
                document.getElementsByTagName("head")[0].appendChild(styleNode);
                if (styleNode.styleSheet) {
                    styleNode.styleSheet.cssText = styleSheets
                } else {
                    styleNode.appendChild(document.createTextNode(styleSheets))
                }
                var _onload = function () {
                    _that.mediator = new PagSeguro.APIMediator({gateway: _that.gateway});
                    _that.listenChannels();
                    _that.syntonize();
                    _that.execQueue()
                };
                if (!window.addEventListener) {
                    _that.gateway.attachEvent("onload", _onload)
                } else {
                    _that.gateway.addEventListener("load", _onload)
                }
            })
        }, syntonize: function () {
            this.publish({
                command: "registerVendor",
                url: window.location.protocol + "//" + window.location.host
            }, "gateway")
        }, publish: function (message, channel) {
            this.mediator.postMessage(message, channel)
        }, subscribe: function (channel, callback) {
            this.mediator.acceptMessage(channel, callback)
        }, setSessionId: function (sessionId) {
            var _that = this;
            pagsegurosession = sessionId;
            this.queue.push(function () {
                _that.publish({command: "setSessionId", sessionId: pagsegurosession}, "gateway")
            });
            this.execQueue()
        }, createCardToken: function (config) {
            var _that = this;
            this.setCallbacks(this.callbacks.createCardToken, config);
            this.queue.push(function () {
                _that.publish({command: "createCardToken", config: _that.deleteFunctions(config)}, "gateway")
            });
            this.execQueue()
        }, getInstallments: function (config) {
            var _that = this;
            this.setCallbacks(this.callbacks.getInstallments, config);
            this.queue.push(function () {
                _that.publish({command: "getInstallments", config: _that.deleteFunctions(config)}, "gateway")
            });
            this.execQueue()
        }, getPaymentMethods: function (config) {
            var _that = this;
            this.setCallbacks(this.callbacks.getPaymentMethods, config);
            this.queue.push(function () {
                _that.publish({command: "getPaymentMethods", config: _that.deleteFunctions(config)}, "gateway")
            });
            this.execQueue()
        }, getBrand: function (config) {
            var _that = this;
            this.setCallbacks(this.callbacks.getBrand, config);
            this.queue.push(function () {
                _that.publish({command: "getBrand", config: _that.deleteFunctions(config)}, "gateway")
            });
            this.execQueue()
        }, execQueue: function () {
            var _that = this;
            if (true === this.ready) {
                while (this.queue.length) {
                    this.queue.shift()()
                }
            } else {
                setTimeout(function () {
                    _that.execQueue()
                }, 100)
            }
        }, setDnaHash: function (value) {
            this.dnahash = value
        }, getSenderHash: function () {
            return this.dnahash
        }, listenChannels: function () {
            var _that = this;
            this.subscribe("gateway", function (data) {
                if (data.command) {
                    switch (data.command) {
                        case"createCardToken":
                            _that.runCallback(_that.callbacks.createCardToken, data.result);
                            break;
                        case"getBrand":
                            _that.runCallback(_that.callbacks.getBrand, data.result);
                            break;
                        case"getInstallments":
                            _that.runCallback(_that.callbacks.getInstallments, data.result);
                            break;
                        case"getPaymentMethods":
                            _that.runCallback(_that.callbacks.getPaymentMethods, data.result);
                            break;
                        case"getReady":
                            _that.ready = true;
                            break;
                        case"setDnaHash":
                            _that.setDnaHash(data.result)
                    }
                }
            })
        }, runCallback: function (callback, result) {
            callback.complete(result);
            if (result.error) {
                callback.error(result)
            } else {
                callback.success(result)
            }
        }, deleteFunctions: function (config) {
            delete config.success;
            delete config.error;
            delete config.complete;
            return config
        }, setCallbacks: function (callback, config) {
            callback.success = config.success ? config.success : function () {
            };
            callback.error = config.error ? config.error : function () {
            };
            callback.complete = config.complete ? config.complete : function () {
            }
        }
    };
    PagSeguro.APIMediator = function (core) {
        var channels = {
            gateway: {
                context: core.gateway.contentWindow,
                url: "https://sandbox.pagseguro.uol.com.br",
                callbacks: []
            }
        };
        this.postMessage = function (message, channel) {
            if (channels[channel]) {
                channels[channel].context.postMessage(JSON.stringify(message), channels[channel].url)
            }
        };
        this.acceptMessage = function (channel, callback) {
            var _that = this, callbacks = channels[channel].callbacks;
            callbacks[callbacks.length] = function (event) {
                if (!channels[channel]) {
                    return
                }
                if (event.origin == channels[channel].url) {
                    callback(JSON.parse(event.data))
                }
            };
            window[window.addEventListener ? "addEventListener" : "attachEvent"](window.addEventListener ? "message" : "onmessage", callbacks[callbacks.length - 1])
        };
        this.commandDispatch = function (command) {
            var _that = this, commands = channels[channel].commands;
            commands[commands.length] = function (event) {
                if (!channels[channel]) {
                    return
                }
                if (event.origin == channels[channel].url) {
                    callback(event.data)
                }
            };
            window[window.addEventListener ? "addEventListener" : "attachEvent"](window.addEventListener ? "message" : "onmessage", callbacks[callbacks.length - 1])
        };
        this.commandAccept = function () {
        };
        this.ignoreMessage = function (channel) {
            var _that = this, i = channels[channel].callbacks.length;
            if (channels[channel]) {
                while (i--) {
                    window[window.removeEventListener ? "removeEventListener" : "detachEvent"](window.removeEventListener ? "message" : "onmessage", channels[channel].callbacks[i])
                }
            }
        }
    };
    window.PagSeguroDirectPayment = window._PagSeguroDirectPayment || new PagSeguro.DirectPayment
})();