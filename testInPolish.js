var translate = function (str) {
    str = str.split(' ');
    var stack = {
        value : [],
        top : function() {return this.value[this.value.length - 1]},
        isEmpty: function() {return ( this.value.length === 0 )}
    }, polish = [];

    str.forEach(function(item) {
        item = operation(item);
        if( item === 'LEFT' ) {
            stack.value.push(item);
        } else if( item == 'NOT' ) {
            stack.value.push(item);
        } else if( item === 'AND' || item === 'OR' || item === 'EQ' || item === 'IMP' || item === ')' ) {
            if( !stack.isEmpty() ) {
                var top = stack.top(),
                    action = table[item][top];
                switch (action) {
                    case 1: stack.value.push(item); break;
                    case 2: polish.push({value: item, isOperation: true}); break;
                    case 3: stack.value.pop(); break;
                    case 4:
                        polish.push({value: stack.value.pop(), isOperation: true});
                        stack.value.push(item);
                        break;
                }
            } else {
                stack.value.push(item);
            }
        } else {
            polish.push({value: item, isOperation: false});
        }
    });
    for( let i = 0; !stack.isEmpty(); i++) {
        polish.push({value: stack.value.pop(), isOperation: true});
    }
    let result = '';
    polish.forEach(function(item, i) {
        result += item.value + ' ';
    });
    return result.substr(0, result.length - 1);
};

function testPolish () {
    var busy = ['a AND b', 'a OR NOT b', '( a | b ) & c'];
    var polish = ['a b AND', 'a b NOT OR', 'a b OR c AND'];
    busy.forEach(function (item, i) {
        var result = translate(item);
        console.log(( result == polish[i] ? 'complit' : 'not'), ' ---- ',result,'|', polish[i])
    });
}