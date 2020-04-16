(function nodeTree () {
    var styles = [
        'background',
        'backgroundColor',
        'backgroundImage',
        'border',
        'borderBottom',
        'borderTop',
        'borderLeft',
        'borderRight',
        'borderColor',
        'borderRadius',
        'borderWidth',
        'color',
        'content',
        'display',
        'font',
        'fontDisplay',
        'fontFamily',
        'fontWeight',
        'height',
        'justifyContent',
        'lineHeight',
        'maxHeight',
        'maxWidth',
        'opacity',
        'outline',
        'overflow',
        'padding',
        'paddingTop',
        'paddingBottom',
        'paddingLeft',
        'paddingRight',
        'position',
        'size',
        'textAlign',
        'textShadow',
        'textTransform',
        'visibility',
        'width',
        'zIndex',
    ];
    
    function sliceByKeys(object, keys) {
        var result = {};
    
        for(var key of keys) {
            var val = object[key];
            if (val && val.length > 0) {
                result[key] = val;
            }
        }
    
        return result;
    }
    
    function getPathTo(element) {
        if (!!element.id)
            return 'id("'+element.id+'")';
        if (element.isEqualNode(document.body))
            return '//' + element.tagName;
    
        var ix = 0;
        var siblings = element.parentNode.childNodes;
        for (var i = 0; i < siblings.length; i++) {
            var sibling = siblings[i];
            if (sibling === element)
                if (element.tagName !== 'HTML') {
                    var tagName = "/*[name()='" + element.tagName.toLowerCase() + "']"
                    return getPathTo(element.parentNode)+'/'+tagName+'['+(ix+1)+']';
                } else {
                    return '/'+element.tagName+'['+(ix+1)+']'
                }
            if (sibling.nodeType === 1 && sibling.tagName === element.tagName)
                ix++;
        }
    }
    
    function findNodeCss(node) {
        var path = getPathTo(node);
        var xpath = document.evaluate(path, document, null, window.XPathResult.ANY_TYPE, null);
        var elem = xpath.iterateNext();
        var css = sliceByKeys(window.getComputedStyle(elem || node), styles);
        var tag = node.tagName;
        var attributes = {};
        [].slice.call(node.attributes).forEach(attribute => {
            attributes[attribute.name] = attribute.value
        });
        var { x, y, width, height } = (elem || node).getBoundingClientRect();
        var coordinates = [[x, y], [x + width, y], [x + width, y + height], [x, y + height]];
    
        var childNodes = node.childNodes;
        if (childNodes.length === 0 && node.hasChildNodes()) {
            var parsedNode = new DOMParser().parseFromString(node.outerHTML, 'text/html');
            var newNode = parsedNode.querySelector('body').childNodes[0];
            childNodes = newNode.childNodes;
        }
    
        var children = [].slice.call(childNodes).map(child => {
            switch (child.nodeType) {
                case 1:
                    if (child.classList.contains('ta-layover')) return null;
                    var childElement = findNodeCss(child);
                    return childElement;
                    break;
                case 3:
                    var text = child.data.trim();
                    if (text) return { node_type: 'Text', value: text };
                    break;
                default:
                    return null;
            }
        }).filter(child => child);
    
        return {
            node_type: 'Element',
            children,
            css,
            tag,
            attributes,
            coordinates,
            path,
        }
    }
    
    function diffByTagName (array1, array2) {
        return array1.map((originalElement) => {
            var elem = array2.find(element => element.tagName === originalElement.tagName);
            if (!elem) return originalElement;
        });
    }
    
    function equalizeDoc(doc) {
        var documentElements = [...document.documentElement.children];
        var docElements = [...doc.documentElement.children];
        if (documentElements.length > docElements.length) {
            var df = diffByTagName(documentElements, docElements);
    
            for (var i in df) {
                if (df[i] && (typeof df[i] === 'object')) {
                    doc.documentElement.insertBefore(df[i], docElements[i]);
                }
            }
        }
    }
    
    function equalizeBody(doc) {
        var headElements = [...document.head.children];
        for(var i=0; i<headElements.length; i++) {
            var dupNode = headElements[i].cloneNode(false);
            doc.head.appendChild(dupNode);
        }
    }
    
    function clearNoscript(doc) {
        var noscripts = doc.querySelectorAll('noscript');
        for(var i=0; i<noscripts.length; i++) {
            noscripts[i].innerHTML = "";
        }
    }
    
    function equalize(doc) {
        equalizeDoc(doc);
        equalizeBody(doc);
        clearNoscript(doc)
    }
    
    var documentString = document.body.outerHTML;
    var doc = new DOMParser().parseFromString(documentString, 'text/html');
    equalize(doc);
    var node = doc.documentElement;
    var nodeCss = JSON.stringify(findNodeCss(node));
    return nodeCss;
})();
