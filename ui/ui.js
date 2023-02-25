function findSection(ele) {
    if (!ele) return;
    while (ele != document.body) {
        if (ele.tagName === 'SECTION') return ele;
        ele = ele.parentElement;
    }
    return;
}
function showAreaOf(btn, name) {
    const _secElem = findSection(btn);
    if (_secElem) {
        let x = _secElem.querySelectorAll(`[slg-textarea]`);
        for (let i = 0; i < x.length; i++) {
            x[i].removeAttribute("active");
        }
        x = _secElem.querySelector(`[slg-textarea-${name}]`);
        x.setAttribute("active", "");

        x = _secElem.querySelectorAll(`[slg-buttons]>button`);
        for (let i = 0; i < x.length; i++) {
            x[i].removeAttribute("active");
        }
        btn.setAttribute("active", "");
    }
}

if (window.self !== window.top) {
    // document.write("The page is in an iFrame");
    // debugger;
} else {
    // document.write("The page is not in an iFrame");
}
