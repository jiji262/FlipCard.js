/* ======================================================= 
 * FlipCard.js 
 * 
 * Apr 10, 2014 v1.2.0
 * By Jiping Hu
 *
 * Twitter: @JipingHu
 * Email: jping.hu@gmail.com
 *
 * Documentation: http://jpinghu.com/flipcardjs

 * Copyright (c) 2013, Jiping Hu. All rights reserved.
 * Released under CodeCanyon License http://codecanyon.net/
 * 
 * ======================================================= */
(function() {
    //define consistent Date.now api
    Date.now = Date.now || function() {
        return +new Date;
    };
    //define console if doesn't exist
    if (typeof window.console === "undefined") {
        window.console = {
            log: function(message) {}
        };
    }

    //define a empty function
    nop = function() {};
    //override Function prototype.bind method
    // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
    if (!Function.prototype.bind) {

        Function.prototype.bind = function(obj) {
            var slice = [].slice,
                args = slice.call(arguments, 1),
                self = this,
                nop = function() {},
                bound = function() {
                    return self.apply(this instanceof nop ? this : (obj || {}),
                        args.concat(slice.call(arguments)));
                };
            nop.prototype = self.prototype;
            bound.prototype = new nop();
            return bound;
        };
    }
})();

(function() {
    //define FlipCardClass
    if (typeof FlipCard === "undefined") {
        FlipCard = {};
    }

    FlipCard.direction = {
        LR: "lr",
        RL: "rl",
        TB: "tb",
        BT: "bt"
    }

    FlipCard.transformDirection = {
        FB: "fb", //front to back
        BF: "bf" //back to front
    }

    FlipCard.classes = {
        CARD_CONTAINER: "card-container",
        CARD: "card",
        FRONT: "front",
        FRONT_X: "front-x",
        FRONT_Y: "front-y",
        BACK: "back",
        BACK_X: "back-x",
        BACK_Y: "back-y",
        BACK_X_R: "back-x-r",
        BACK_Y_R: "back-y-r",
        FLIPPED_PREFIX: "flipped-",
        FLIPPED_LR: "flipped-lr",
        FLIPPED_RL: "flipped-rl",
        FLIPPED_TB: "flipped-tb",
        FLIPPED_BT: "flipped-bt",
        NO_TRANSITION: "notransition",
        IE10: "ie10"
    }

    FlipCard.htmlAttr = {
        SPEED: "transition-duration",
        TIMING_FUNCTION: "transition-timing-function"
    }

    FlipCard.browser = {
        IsSupportTransform3D: false,
        IsSupportTransition: false,
        IsSupportCSS3: false,
        IsIE10: false,
        TRANSITIONEND: "transitionend",
        VENDOR: ["-webkit-", "-moz-", "-ms-", "-o-", ""],

        _detect: function() {
            this.IsSupportTransition = this._isSupportCssProperty("transition");
            this.IsSupportTransform3D = this._isSupportCssProperty("perspective");
            this.IsSupportCSS3 = this.IsSupportTransition && this.IsSupportTransform3D;
            console.log(this.IsSupportTransition + "," + this.IsSupportTransform3D + "," + this.IsSupportCSS3);
            this.TRANSITIONEND = this._whichTransitionEvent();
            this.IsIE10 = this._isIE10();
        },

        _whichTransitionEvent: function() {
            var t;
            var el = document.createElement('div');
            var transitions = {
                'WebkitTransition': 'webkitTransitionEnd', //chrome, safari
                'transition': 'transitionend', //IE10 
                'OTransition': 'transitionend', //after opera 12.10, it transitionEnd, it was otransitionend at opera 12, and it was oTransitionEnd at opera 10.5
                'MozTransition': 'transitionend' //moz 
            }

            for (t in transitions) {
                if (el.style[t] !== undefined) {
                    return transitions[t];
                }
            }

            return "transitionend";
        },
        _getIEVersion: function() {
            var rv = -1;
            if (navigator.appName == 'Microsoft Internet Explorer') {
                var ua = navigator.userAgent;
                var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
                if (re.exec(ua) != null)
                    rv = parseFloat(RegExp.$1);
            } else if (navigator.appName == 'Netscape') {
                var ua = navigator.userAgent;
                var re = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");
                if (re.exec(ua) != null)
                    rv = parseFloat(RegExp.$1);
            }
            return rv;
        },

        _isIE10: function() {
            var ver = this._getIEVersion();
            return ver >= 10;
        },

        _isSupportCssProperty: function(p) {
            var b = document.body || document.documentElement,
                s = b.style;

            // No css support detected
            if (typeof s === 'undefined') {
                return false;
            }

            // Tests for standard prop
            if (typeof s[p] === 'string') {
                return true;
            }

            // Tests for vendor specific prop
            v = ['Moz', 'webkit', 'Webkit', 'Khtml', 'O', 'ms'],
            p = p.charAt(0).toUpperCase() + p.substr(1);
            for (var i = 0; i < v.length; i++) {
                if (typeof s[v[i] + p] === 'string') {
                    return true;
                }
            }
            return false;
        }
    }
    FlipCard.browser._detect();

    FlipCard.timingfunction = {
        'ease': 'ease',
        'ease-in': 'ease-in',
        'ease-out': 'ease-out',
        'ease-in-out': 'ease-in-out',
        'linear': 'linear',
        //number must be in [0, 1], safari 5 doesn't support numbers out of [0,1]
        'ease-in-quad': 'cubic-bezier(0.550, 0.085, 0.680, 0.530)',
        'ease-in-cubic': 'cubic-bezier(0.550, 0.055, 0.675, 0.190)',
        'ease-in-quart': 'cubic-bezier(0.895, 0.030, 0.685, 0.220)',
        'ease-in-quint': 'cubic-bezier(0.755, 0.050, 0.855, 0.060)',
        'ease-in-sine': 'cubic-bezier(0.470, 0.000, 0.745, 0.715)',
        'ease-in-expo': 'cubic-bezier(0.950, 0.050, 0.795, 0.035)',
        'ease-in-circ': 'cubic-bezier(0.600, 0.040, 0.980, 0.335)',

        'ease-out-quad': 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
        'ease-out-cubic': 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
        'ease-out-quart': 'cubic-bezier(0.165, 0.840, 0.440, 1.000)',
        'ease-out-quint': 'cubic-bezier(0.230, 1.000, 0.320, 1.000)',
        'ease-out-sine': 'cubic-bezier(0.390, 0.575, 0.565, 1.000)',
        'ease-out-expo': 'cubic-bezier(0.190, 1.000, 0.220, 1.000)',
        'ease-out-circ': 'cubic-bezier(0.075, 0.820, 0.165, 1.000)',

        'ease-in-out-quad': 'cubic-bezier(0.455, 0.030, 0.515, 0.955)',
        'ease-in-out-cubic': 'cubic-bezier(0.645, 0.045, 0.355, 1.000)',
        'ease-in-out-quart': 'cubic-bezier(0.770, 0.000, 0.175, 1.000)',
        'ease-in-out-quint': 'cubic-bezier(0.860, 0.000, 0.070, 1.000)',
        'ease-in-out-sine': 'cubic-bezier(0.445, 0.050, 0.550, 0.950)',
        'ease-in-out-expo': 'cubic-bezier(1.000, 0.000, 0.000, 1.000)',
        'ease-in-out-circ': 'cubic-bezier(0.785, 0.135, 0.150, 0.860)'
    }

    FlipCard.datakey = {
        IS_ANIMATING: "isanimating",
        AUTOFLIP_TIMEOUT: "autofliptimeout",
        STOPAUTOFLIP: "stopautoflip"
    }
})();

(function($, FlipCard) {
    $.fn.flip = function(options) {
        options = options || {};
        return this.each(function() {
            var containerEl = $(this),
                cardEl, frontEl, backEl, flipOptions, lastFlippedDir, transDir, autoflipdelaytime, autoflipstarttime;

            doit();

            function doit() {
                //this only clear timeout which is already set up, but can't stop animating
                stopAutoFlip();
                //if options is a string command, 
                if (typeof options === "string") {
                    //this make sure flipping will be stopped, but can't stop the current animating
                    if (options === "stopautoflip") {
                        containerEl.data(FlipCard.datakey.STOPAUTOFLIP, 1);
                    }
                } else {
                    init();
                    if (flipOptions.autoflip === "true") {
                        containerEl.data(FlipCard.datakey.STOPAUTOFLIP, 0);
                        startAutoFlip(autoflipstarttime);
                    } else {
                        doFlip();
                    }
                }
            }

            function doFlip() {
                //check if it's animating, if yes, we do nothing on this element
                if (!getIsAnimating()) {
                    setIsAnimating();
                    reset();
                    flip();
                }
            }

            function startAutoFlip(delay) {
                stopAutoFlip();
                var autoflipTimeout = window.setTimeout(doFlip, delay);
                containerEl.data(FlipCard.datakey.AUTOFLIP_TIMEOUT, autoflipTimeout);
            }

            function stopAutoFlip() {
                var autoflipTimeout = containerEl.data(FlipCard.datakey.AUTOFLIP_TIMEOUT);
                if (autoflipTimeout !== null && autoflipTimeout !== undefined && autoflipTimeout > 0) {
                    window.clearTimeout(autoflipTimeout);
                    containerEl.data(FlipCard.datakey.AUTOFLIP_TIMEOUT, -1);
                }
            }

            function init() {
                cardEl = containerEl.children("." + FlipCard.classes.CARD);
                frontEl = cardEl.children("." + FlipCard.classes.FRONT);
                backEl = cardEl.children("." + FlipCard.classes.BACK);

                //validate html structure
                if (!containerEl.hasClass(FlipCard.classes.CARD_CONTAINER)) {
                    throw "the selected html element must have card-container class";
                }
                if (cardEl.length === 0) {
                    throw "Must have .card html element";
                }
                if (frontEl.length === 0) {
                    throw "Must have .front html element";
                }
                if (backEl.length === 0) {
                    throw "Must have .back html element";
                }

                //default options 
                flipOptions = {
                    autoflip: 'false',
                    autoflipstart: '0s',
                    autoflipdelay: '2s',
                    direction: FlipCard.direction.LR,
                    alwaysOneDirection: 'false',
                    speed: '500ms',
                    timingfunction: 'ease',
                    when: {
                        onflipping: nop,
                        onflipped: nop
                    }
                }
                //set up options
                var key;
                for (key in flipOptions) {
                    if (key === "when") continue;
                    if (flipOptions.hasOwnProperty(key)) {
                        var htmlAttrKey = "data-" + key;
                        if (options.hasOwnProperty(key))
                            flipOptions[key] = options[key].toString();
                        else if (hasHtmlAttr(containerEl, htmlAttrKey))
                            flipOptions[key] = containerEl.attr(htmlAttrKey);
                    }
                }
                if (typeof options.onflipping === "function") {
                    flipOptions.when.onflipping = options.onflipping;
                }
                if (typeof options.onflipped === "function") {
                    flipOptions.when.onflipped = options.onflipped;
                }

                autoflipdelaytime = convertDelayStringToMilliSeconds(flipOptions.autoflipdelay);
                autoflipstarttime = convertDelayStringToMilliSeconds(flipOptions.autoflipstart);

                if (FlipCard.browser.IsSupportCSS3) {
                    if (!isBackVisible()) {
                        backEl.show();
                    }
                    if (FlipCard.browser.IsIE10 && !cardEl.hasClass(FlipCard.classes.IE10)) {
                        cardEl.addClass(FlipCard.classes.IE10);
                        cardEl.height();
                    }
                } else if (!cardEl.hasClass(FlipCard.classes.NO_TRANSITION)) {
                    cardEl.addClass(FlipCard.classes.NO_TRANSITION);
                    cardEl.height();
                }
            }

            function reset() {
                //reset speed, timingfunction
                if (FlipCard.browser.IsIE10) {
                    resetPropertyValue(frontEl, FlipCard.htmlAttr.SPEED, flipOptions.speed, isDefaultSpeed);
                    resetPropertyValue(frontEl, FlipCard.htmlAttr.TIMING_FUNCTION, getTimingFunctionValue(), isDefaultTimingFunction);
                    resetPropertyValue(backEl, FlipCard.htmlAttr.SPEED, flipOptions.speed, isDefaultSpeed);
                    resetPropertyValue(backEl, FlipCard.htmlAttr.TIMING_FUNCTION, getTimingFunctionValue(), isDefaultTimingFunction);
                } else {
                    resetPropertyValue(cardEl, FlipCard.htmlAttr.SPEED, flipOptions.speed, isDefaultSpeed);
                    resetPropertyValue(cardEl, FlipCard.htmlAttr.TIMING_FUNCTION, getTimingFunctionValue(), isDefaultTimingFunction);
                }


                lastFlippedDir = getLastFlippedDir(containerEl);
                transDir = getTransformDirection(lastFlippedDir);
            }

            function flip() {
                //before flip, attach transitionend event listener
                addTransitionEvent();

                //special handler for IE10 less (IE8, IE9)
                if (!FlipCard.browser.IsSupportCSS3) {
                    var fadingOptions = {
                        duration: convertDelayStringToMilliSeconds(flipOptions.speed),
                        complete: onTransitionEnd
                    }
                    if (isBackVisible()) {
                        backEl.hide();
                        //frontEl.fadeIn(flipOptions.speed, flipOptions.timingfunction, onTransitionEnd);
                        frontEl.fadeIn(fadingOptions);
                    } else {
                        frontEl.hide();
                        //backEl.fadeIn(flipOptions.speed, flipOptions.timingfunction, onTransitionEnd);
                        backEl.fadeIn(fadingOptions);
                    }

                    return;
                }

                //flip
                var flippedClass = FlipCard.classes.FLIPPED_PREFIX + flipOptions.direction;
                var lastFlippedClass = FlipCard.classes.FLIPPED_PREFIX + lastFlippedDir.direction;
                if (FlipCard.browser.IsIE10) {
                    var dir = flipOptions.direction;

                    if (transDir === FlipCard.transformDirection.FB) {
                        resetFrontBackElementClass(dir, flippedClass, lastFlippedClass, transDir);
                        containerEl.addClass(flippedClass);
                    } else {
                        if (flipOptions.alwaysOneDirection === 'true') {
                            dir = getOppositeDirection(flipOptions.direction);
                            flippedClass = FlipCard.classes.FLIPPED_PREFIX + getOppositeDirection(flipOptions.direction);
                        }
                        resetFrontBackElementClass(dir, flippedClass, lastFlippedClass, transDir);
                        //remove flipped css and animating
                        removeAnyFlippedClass();
                    }
                } else {
                    //front to back
                    if (transDir === FlipCard.transformDirection.FB) {
                        resetBackElementClass();
                        containerEl.addClass(flippedClass);
                    }
                    //back to front
                    else {
                        if (flipOptions.alwaysOneDirection === 'true') {
                            flippedClass = FlipCard.classes.FLIPPED_PREFIX + getOppositeDirection(flipOptions.direction);
                        }

                        //in flipped state, now doing back to front
                        //if last flipped direction is the currrent direction, just remove flipped class
                        //if not, we need disable transition, change css, reflow page and enable css
                        if (lastFlippedDir.direction !== flipOptions.direction || flipOptions.alwaysOneDirection === "true") {
                            //disable card transition
                            cardEl.addClass(FlipCard.classes.NO_TRANSITION);
                            //change all kinds of css
                            containerEl.removeClass(lastFlippedClass);
                            containerEl.addClass(flippedClass);

                            //for same kind of direction e.g. lr <=> rl  tb <=> bt, don't change back class
                            //but e.g. lr / rl <=> tb / bt, we need change back class
                            if (!isSameKindOfDirection(lastFlippedDir.direction, flipOptions.direction)) {
                                resetBackElementClass();
                            }
                            //enforce to reflow page
                            containerEl.height();
                            //enable transition again
                            cardEl.removeClass(FlipCard.classes.NO_TRANSITION);
                        }
                        //remove flipped css and animating
                        removeAnyFlippedClass();
                    }
                }
            }

            function getOppositeDirection(dir) {
                if (dir === FlipCard.direction.LR) return FlipCard.direction.RL;
                else if (dir === FlipCard.direction.RL) return FlipCard.direction.LR;
                else if (dir === FlipCard.direction.BT) return FlipCard.direction.TB;
                else return FlipCard.direction.BT;
            }

            function convertDelayStringToMilliSeconds(delayTimeString) {
                //delayTimeString e.g. '500', '0.5s', '.5s', '500ms' to 500
                var errorMessage = "Invalid format for autoflipdelay/autoflipstart option. Make sure you specify it like '500' or '500ms' or '0.5s' or '.5s' ";
                try {
                    var index = delayTimeString.indexOf("ms");
                    if (index >= 0) {
                        return parseFloat(delayTimeString.substring(0, index));
                    } else {
                        var index2 = delayTimeString.indexOf("s");
                        if (index2 >= 0) {
                            return 1000 * parseFloat(delayTimeString.substring(0, index2));
                        } else {
                            return parseFloat(delayTimeString);
                        }

                    }
                } catch (err) {
                    throw errorMessage;
                }
            }

            function getTimingFunctionValue() {
                if (FlipCard.timingfunction.hasOwnProperty(flipOptions.timingfunction)) {
                    return FlipCard.timingfunction[flipOptions.timingfunction];
                } else {
                    return flipOptions.timingfunction;
                }
            }

            function resetPropertyValue(el, propName, propValue, isDefaultFunc) {
                var i, isDefault = isDefaultFunc();
                for (i in FlipCard.browser.VENDOR) {
                    var prop = FlipCard.browser.VENDOR[i] + propName;
                    //Clear transition-duration style 
                    if (isDefault) {
                        el.css(prop, "");
                    } else {
                        el.css(prop, propValue);
                    }
                }
            }

            function isDefaultSpeed() {
                return flipOptions.speed === "500ms" || flipOptions.speed === "0.5s" || flipOptions.speed === ".5s";
            }

            function isDefaultTimingFunction() {
                return flipOptions.timingfunction === "ease";
            }

            function getIsAnimating() {
                return containerEl.data(FlipCard.datakey.IS_ANIMATING) === 1;
            }

            function setIsAnimating() {
                containerEl.data(FlipCard.datakey.IS_ANIMATING, 1);
            }

            function releaseIsAnimating() {
                containerEl.data(FlipCard.datakey.IS_ANIMATING, 0);
            }

            function resetBackElementClass() {
                if (flipOptions.direction === FlipCard.direction.LR || flipOptions.direction === FlipCard.direction.RL) {
                    backEl.removeClass(FlipCard.classes.BACK_X);
                    if (!backEl.hasClass(FlipCard.classes.BACK_Y)) {
                        backEl.addClass(FlipCard.classes.BACK_Y);
                    }
                } else {
                    backEl.removeClass(FlipCard.classes.BACK_Y);
                    if (!backEl.hasClass(FlipCard.classes.BACK_X)) {
                        backEl.addClass(FlipCard.classes.BACK_X);
                    }
                }
            }

            function resetFrontBackElementClass(dir, flippedClass, lastFlippedClass, transDir) {
                frontEl.addClass(FlipCard.classes.NO_TRANSITION);
                backEl.addClass(FlipCard.classes.NO_TRANSITION);
                if (transDir === FlipCard.transformDirection.BF) {
                    //change all kinds of css
                    containerEl.removeClass(lastFlippedClass);
                    containerEl.addClass(flippedClass);
                }

                if (dir === FlipCard.direction.LR || dir === FlipCard.direction.RL) {
                    frontEl.removeClass(FlipCard.classes.FRONT_X);
                    if (!frontEl.hasClass(FlipCard.classes.FRONT_Y)) {
                        frontEl.addClass(FlipCard.classes.FRONT_Y);
                    }

                    if (dir === FlipCard.direction.LR) {
                        backEl.removeClass(FlipCard.classes.BACK_X);
                        backEl.removeClass(FlipCard.classes.BACK_X_R);
                        backEl.removeClass(FlipCard.classes.BACK_Y_R);
                        if (!backEl.hasClass(FlipCard.classes.BACK_Y)) {
                            backEl.addClass(FlipCard.classes.BACK_Y);
                        }
                    } else {
                        backEl.removeClass(FlipCard.classes.BACK_X);
                        backEl.removeClass(FlipCard.classes.BACK_X_R);
                        backEl.removeClass(FlipCard.classes.BACK_Y);
                        if (!backEl.hasClass(FlipCard.classes.BACK_Y_R)) {
                            backEl.addClass(FlipCard.classes.BACK_Y_R);
                        }
                    }
                } else {
                    frontEl.removeClass(FlipCard.classes.FRONT_Y);
                    if (!frontEl.hasClass(FlipCard.classes.FRONT_X)) {
                        frontEl.addClass(FlipCard.classes.FRONT_X);
                    }

                    if (dir === FlipCard.direction.TB) {
                        backEl.removeClass(FlipCard.classes.BACK_Y);
                        backEl.removeClass(FlipCard.classes.BACK_Y_R);
                        backEl.removeClass(FlipCard.classes.BACK_X_R);
                        if (!backEl.hasClass(FlipCard.classes.BACK_X)) {
                            backEl.addClass(FlipCard.classes.BACK_X);
                        }
                    } else {
                        backEl.removeClass(FlipCard.classes.BACK_Y);
                        backEl.removeClass(FlipCard.classes.BACK_Y_R);
                        backEl.removeClass(FlipCard.classes.BACK_X);
                        if (!backEl.hasClass(FlipCard.classes.BACK_X_R)) {
                            backEl.addClass(FlipCard.classes.BACK_X_R);
                        }
                    }
                }
                containerEl.height();
                frontEl.removeClass(FlipCard.classes.NO_TRANSITION);
                backEl.removeClass(FlipCard.classes.NO_TRANSITION);
            }

            function removeAnyFlippedClass() {
                containerEl.removeClass(FlipCard.classes.FLIPPED_LR);
                containerEl.removeClass(FlipCard.classes.FLIPPED_RL);
                containerEl.removeClass(FlipCard.classes.FLIPPED_TB);
                containerEl.removeClass(FlipCard.classes.FLIPPED_BT);
            }

            function getLastFlippedDir(targetEl) {
                var result = {
                    flipped: false,
                    direction: ''
                }

                if (FlipCard.browser.IsSupportCSS3) {
                    if (targetEl.hasClass(FlipCard.classes.FLIPPED_LR)) {
                        result.flipped = true;
                        result.direction = FlipCard.direction.LR;
                    } else if (targetEl.hasClass(FlipCard.classes.FLIPPED_RL)) {
                        result.flipped = true;
                        result.direction = FlipCard.direction.RL;
                    } else if (targetEl.hasClass(FlipCard.classes.FLIPPED_TB)) {
                        result.flipped = true;
                        result.direction = FlipCard.direction.TB;
                    } else if (targetEl.hasClass(FlipCard.classes.FLIPPED_BT)) {
                        result.flipped = true;
                        result.direction = FlipCard.direction.BT;
                    }
                } else {
                    result.direction = "";
                    result.flipped = isBackVisible();
                }

                return result;
            }

            function getTransformDirection(lastFlippedDir) {
                return lastFlippedDir.flipped ? FlipCard.transformDirection.BF : FlipCard.transformDirection.FB;
            }

            function isBackVisible() {
                return !(backEl.css("display") === "none");
            }

            function isSameKindOfDirection(dir1, dir2) {
                return (dir1 === dir2) ||
                    (dir1 === FlipCard.direction.LR && dir2 === FlipCard.direction.RL) ||
                    (dir1 === FlipCard.direction.RL && dir2 === FlipCard.direction.LR) ||
                    (dir1 === FlipCard.direction.TB && dir2 === FlipCard.direction.BT) ||
                    (dir1 === FlipCard.direction.BT && dir2 === FlipCard.direction.TB);
            }

            function hasHtmlAttr(el, name) {
                var attr = el.attr(name);
                return typeof attr !== 'undefined' && attr !== false;
            }

            function onTransitionEnd() {
                if (FlipCard.browser.IsSupportCSS3) {
                    cardEl.off(FlipCard.browser.TRANSITIONEND, onTransitionEnd);
                }

                flipOptions.when.onflipped(flipOptions.direction, transDir);
                releaseIsAnimating();
                if (flipOptions.autoflip === "true" && containerEl.data(FlipCard.datakey.STOPAUTOFLIP) !== 1) {
                    startAutoFlip(autoflipdelaytime);
                } else {
                    containerEl.data(FlipCard.datakey.STOPAUTOFLIP, 0);
                }
            }

            function addTransitionEvent() {
                if (FlipCard.browser.IsSupportCSS3) {
                    cardEl.on(FlipCard.browser.TRANSITIONEND, onTransitionEnd);
                }
                //exec onflipping function
                flipOptions.when.onflipping(flipOptions.direction, transDir);
            }


        })
    }
})(jQuery, FlipCard)