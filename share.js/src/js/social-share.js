<link rel="stylesheet" class="aplayer-secondary-style-marker" href="\assets\css\APlayer.min.css"><script src="\assets\js\APlayer.min.js" class="aplayer-secondary-script-marker"></script><script class="meting-secondary-script-marker" src="\assets\js\Meting.min.js"></script>/**
 * social-share.js
 *
 * @author  52cik <fe.52cik@gmail.com>
 * @license MIT
 *
 * @example
 * <pre> * socialShare('.share-components');
 *
 * // or
 *
 * socialShare('.share-bar', {
 *     sites: ['qzone', 'qq', 'weibo','wechat'],
 *     // ...
 * });
 * </pre>
 */
;(function (window, document, undefined) {

    // Initialize a variables.

    var Array$indexOf = Array.prototype.indexOf;
    var Object$assign = Object.assign;

    var runningInWeChat = /MicroMessenger/i.test(navigator.userAgent);
    var isMobileScreen = document.documentElement.clientWidth &lt;= 768;

    var image = (document.images[0] || 0).src || '';
    var site = getMetaContentByName('site') || getMetaContentByName('Site') || document.title;
    var title = getMetaContentByName('title') || getMetaContentByName('Title') || document.title;
    var description = getMetaContentByName('description') || getMetaContentByName('Description') || '';

    var defaults = {
        url: location.href,
        origin: location.origin,
        source: site,
        title: title,
        description: description,
        image: image,
        imageSelector: undefined,

        weiboKey: '',

        wechatQrcodeTitle: '微信扫一扫：分享',
        wechatQrcodeHelper: '<p>微信里点“发现”，扫一下</p><p>二维码便可将本文分享至朋友圈。</p>',
        wechatQrcodeSize: 100,

        sites: ['weibo', 'qq', 'wechat', 'douban', 'qzone', 'linkedin', 'facebook', 'twitter', 'google'],
        mobileSites: [],
        disabled: [],
        initialized: false
    };

    var templates = {
        qzone: 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=&amp;title=&amp;desc=&amp;summary=&amp;site=&amp;pics=',
        qq: 'http://connect.qq.com/widget/shareqq/index.html?url=&amp;title=&amp;source=&amp;desc=&amp;pics=&amp;summary=""',
        weibo: 'https://service.weibo.com/share/share.php?url=&amp;title=&amp;pic=&amp;appkey=',
        wechat: 'javascript:',
        douban: 'http://shuo.douban.com/!service/share?href=&amp;name=&amp;text=&amp;image=&amp;starid=0&amp;aid=0&amp;style=11',
        linkedin: 'http://www.linkedin.com/shareArticle?mini=true&amp;ro=true&amp;title=&amp;url=&amp;summary=&amp;source=&amp;armin=armin',
        facebook: 'https://www.facebook.com/sharer/sharer.php?u=',
        twitter: 'https://twitter.com/intent/tweet?text=&amp;url=&amp;via=',
        google: 'https://plus.google.com/share?url='
    };


    /**
     * Expose API to the global
     *
     * @param  {String|Element} elem
     * @param  {Object} options
     */
    window.socialShare = function (elem, options) {
        elem = typeof elem === 'string' ? querySelectorAlls(elem) : elem;

        if (elem.length === undefined) {
            elem = [elem];
        }

        each(elem, function (el) {
            if (!el.initialized) {
                share(el, options);
            }
        });
    };

    // Domready after initialization
    alReady(function () {
        socialShare('.social-share, .share-component');
    });


    /**
     * Initialize a share bar.
     *
     * @param {Object}        $options globals (optional).
     *
     * @return {Void}
     */
    function share(elem, options) {
        var data = mixin({}, defaults, options || {}, dataset(elem));

        if (data.imageSelector) {
            data.image = querySelectorAlls(data.imageSelector).map(function(item) {
                return item.src;
            }).join('||');
        }

        addClass(elem, 'share-component social-share');
        createIcons(elem, data);
        createWechat(elem, data);

        elem.initialized = true;
    }


    /**
     * Create site icons
     *
     * @param {Element} elem
     * @param {Object} data
     */
    function createIcons(elem, data) {
        var sites = getSites(data);
        var isPrepend = data.mode == 'prepend';

        each(isPrepend ? sites.reverse() : sites, function (name) {
            var url = makeUrl(name, data);
            var link = data.initialized ? getElementsByClassName(elem, 'icon-' + name) : createElementByString('<a class="social-share-icon icon-' + name + '"></a>');

            if (!link.length) {
                return true;
            }

            link[0].href = url;

            if (name === 'wechat') {
                link[0].tabindex = -1;
            } else {
                link[0].target = '_blank';
            }

            if (!data.initialized) {
                isPrepend ? elem.insertBefore(link[0], elem.firstChild) : elem.appendChild(link[0]);
            }
        });
    }


    /**
     * Create the wechat icon and QRCode.
     *
     * @param {Element} elem
     * @param {Object} data
     */
    function createWechat (elem, data) {
        var wechat = getElementsByClassName(elem, 'icon-wechat', 'a');

        if (wechat.length === 0) {
            return false;
        }

        var elems = createElementByString('<div class="wechat-qrcode"><h4>' + data.wechatQrcodeTitle + '</h4><div class="qrcode"></div><div class="help">' + data.wechatQrcodeHelper + '</div></div>');
        var qrcode = getElementsByClassName(elems[0], 'qrcode', 'div');

        new QRCode(qrcode[0], {text: data.url, width: data.wechatQrcodeSize, height: data.wechatQrcodeSize});
        wechat[0].appendChild(elems[0]);
    }


    /**
     * Get available site lists.
     *
     * @param {Object} data
     *
     * @returns {Array}
     */
    function getSites(data) {
        if (!data['mobileSites'].length) {
            data['mobileSites'] = data['sites'];
        }

        var sites = (isMobileScreen ? data['mobileSites'] : data['sites']).slice(0);
        var disabled = data['disabled'];

        if (typeof sites == 'string') {
            sites = sites.split(/\s*,\s*/);
        }
        if (typeof disabled == 'string') {
            disabled = disabled.split(/\s*,\s*/);
        }

        if (runningInWeChat) {
            disabled.push('wechat');
        }

        // Remove elements
        disabled.length &amp;&amp; each(disabled, function (it) {
            sites.splice(inArray(it, sites), 1);
        });

        return sites;
    }


    /**
     * Build the url of icon.
     *
     * @param {String} name
     * @param {Object} data
     *
     * @returns {String}
     */
    function makeUrl(name, data) {

        if (! data['summary']){
            data['summary'] = data['description'];
        }

        return templates[name].replace(/\{\{(\w)(\w*)\}\}/g, function (m, fix, key) {
            var nameKey = name + fix + key.toLowerCase();
            key = (fix + key).toLowerCase();

            return encodeURIComponent((data[nameKey] === undefined ? data[key] : data[nameKey]) || '');
        });
    }


    /**
     * Supports querySelectorAll, jQuery, Zepto and simple selector.
     *
     * @param str
     *
     * @returns {*}
     */
    function querySelectorAlls(str) {
        return (document.querySelectorAll || window.jQuery || window.Zepto || selector).call(document, str);
    }


    /**
     * Simple selector.
     *
     * @param {String} str #ID or .CLASS
     *
     * @returns {Array}
     */
    function selector(str) {
        var elems = [];

        each(str.split(/\s*,\s*/), function(s) {
            var m = s.match(/([#.])(\w+)/);
            if (m === null) {
                throw Error('Supports only simple single #ID or .CLASS selector.');
            }

            if (m[1]) {
                var elem = document.getElementById(m[2]);

                if (elem) {
                    elems.push(elem);
                }
            }

            elems = elems.concat(getElementsByClassName(str));
        });

        return elems;
    }


    /**
     * Add the classNames for element.
     *
     * @param {Element} elem
     * @param {String} value
     */
    function addClass(elem, value) {
        if (value &amp;&amp; typeof value === "string") {
            var classNames = (elem.className + ' ' + value).split(/\s+/);
            var setClass = ' ';

            each(classNames, function (className) {
                if (setClass.indexOf(' ' + className + ' ') &lt; 0) {
                    setClass += className + ' ';
                }
            });

            elem.className = setClass.slice(1, -1);
        }
    }


    /**
     * Get meta element content value
     *
     * @param {String} name
     *
     * @returns {String|*}
     */
    function getMetaContentByName(name) {
        return (document.getElementsByName(name)[0] || 0).content;
    }


    /**
     * Get elements By className for IE8-
     *
     * @param {Element} elem element
     * @param {String} name className
     * @param {String} tag tagName
     *
     * @returns {HTMLCollection|Array}
     */
    function getElementsByClassName(elem, name, tag) {
        if (elem.getElementsByClassName) {
            return elem.getElementsByClassName(name);
        }

        var elements = [];
        var elems = elem.getElementsByTagName(tag || '*');
        name = ' ' + name + ' ';

        each(elems, function (elem) {
            if ((' ' + (elem.className || '') + ' ').indexOf(name) &gt;= 0) {
                elements.push(elem);
            }
        });

        return elements;
    }


    /**
     * Create element by string.
     *
     * @param {String} str
     *
     * @returns {NodeList}
     */
    function createElementByString(str) {
        var div = document.createElement('div');
        div.innerHTML = str;

        return div.childNodes;
    }


    /**
     * Merge objects.
     *
     * @returns {Object}
     */
    function mixin() {
        var args = arguments;

        if (Object$assign) {
            return Object$assign.apply(null, args);
        }

        var target = {};

        each(args, function (it) {
            each(it, function (v, k) {
                target[k] = v;
            });
        });

        return args[0] = target;
    }


    /**
     * Get dataset object.
     *
     * @param {Element} elem
     *
     * @returns {Object}
     */
    function dataset(elem) {
        if (elem.dataset) {
            return JSON.parse(JSON.stringify(elem.dataset));
        }

        var target = {};

        if (elem.hasAttributes()) {
            each(elem.attributes, function (attr) {
                var name = attr.name;
                if (name.indexOf('data-') !== 0) {
                    return true;
                }

                name = name.replace(/^data-/i, '')
                    .replace(/-(\w)/g, function (all, letter) {
                        return letter.toUpperCase();
                    });

                target[name] = attr.value;
            });

            return target;
        }

        return {};
    }


    /**
     * found element in the array.
     *
     * @param {Array|Object} elem
     * @param {Array} arr
     * @param {Number} i
     *
     * @returns {Number}
     */
    function inArray(elem, arr, i) {
        var len;

        if (arr) {
            if (Array$indexOf) {
                return Array$indexOf.call(arr, elem, i);
            }

            len = arr.length;
            i = i ? i &lt; 0 ? Math.max(0, len + i) : i : 0;

            for (; i &lt; len; i++) {
                // Skip accessing in sparse arrays
                if (i in arr &amp;&amp; arr[i] === elem) {
                    return i;
                }
            }
        }

        return -1;
    }


    /**
     * Simple each.
     *
     * @param {Array|Object} obj
     * @param {Function} callback
     *
     * @returns {*}
     */
    function each(obj, callback) {
        var length = obj.length;

        if (length === undefined) {
            for (var name in obj) {
                if (obj.hasOwnProperty(name)) {
                    if (callback.call(obj[name], obj[name], name) === false) {
                        break;
                    }
                }
            }
        } else {
            for (var i = 0; i &lt; length; i++) {
                if (callback.call(obj[i], obj[i], i) === false) {
                    break;
                }
            }
        }
    }


    /**
     * Dom ready.
     *
     * @param {Function} fn
     *
     * @link https://github.com/jed/alReady.js
     */
    function alReady ( fn ) {
        var add = 'addEventListener';
        var pre = document[ add ] ? '' : 'on';

        ~document.readyState.indexOf( 'm' ) ? fn() :
            'load DOMContentLoaded readystatechange'.replace( /\w+/g, function( type, i ) {
                ( i ? document : window )
                    [ pre ? 'attachEvent' : add ]
                (
                    pre + type,
                    function(){ if ( fn ) if ( i &lt; 6 || ~document.readyState.indexOf( 'm' ) ) fn(), fn = 0 },
                    !1
                )
            })
    }
})(window, document);
</fe.52cik@gmail.com><script>
        document.querySelectorAll('.github-emoji')
          .forEach(el => {
            if (!el.dataset.src) { return; }
            const img = document.createElement('img');
            img.style = 'display:none !important;';
            img.src = el.dataset.src;
            img.addEventListener('error', () => {
              img.remove();
              el.style.color = 'inherit';
              el.style.backgroundImage = 'none';
              el.style.background = 'none';
            });
            img.addEventListener('load', () => {
              img.remove();
            });
            document.body.appendChild(img);
          });
      </script>