/*
! - 1
& - 2
| - 3
-> - 4 следование импликация
<-> - 5
инстина - все 1
ложь все 0
выполнима, 1-1
не выполнима 1-0
*/
var vars = [];

var calculate = {};

calculate.AND = function (mass, data) {
    var arg1 = mass.pop();
    var arg2 = mass.pop();
    if( "01".indexOf(arg1) === -1 ) arg1 = data[arg1];
    if( "01".indexOf(arg2) === -1 ) arg2 = data[arg2];
    return arg1*1 && arg2*1;
};

calculate.OR = function (mass, data) {
    var arg1 = mass.pop(),
        arg2 = mass.pop();
    if( "01".indexOf(arg1) === -1 ) arg1 = data[arg1];
    if( "01".indexOf(arg2) === -1 ) arg2 = data[arg2];
    return arg1*1 || arg2*1;
};

calculate.NOT = function (mass, data) {
    var arg = mass.pop();
    arg = ( "01".indexOf(arg) === -1 ? data[arg]*1 : arg*1);
    return ( arg === 1 ? 0 : 1);
};

calculate.IMP = function (mass, data) {
    var arg1 = mass.pop(),
        arg2 = mass.pop(),
        result;
    if( "01".indexOf(arg1) === -1 ) arg1 = data[arg1];
    if( "01".indexOf(arg2) === -1 ) arg2 = data[arg2];
    if(arg1 == '0' && arg2 == '0') result = 1;
    if(arg1 == '1' && arg2 == '0') result = 1;
    if(arg1 == '0' && arg2 == '1') result = 0;
    if(arg1 == '1' && arg2 == '1') result = 1;
    return result;
};

calculate.EQ = function (mass, data) {
    var arg1 = mass.pop(),
        arg2 = mass.pop();
    arg1 = ( "01".indexOf(arg1) === -1 ? data[arg1]*1 : arg1*1);
    arg2 = ( "01".indexOf(arg2) === -1 ? data[arg2]*1 : arg2*1);
    return (arg1 == arg2)*1;
};

var setRightVid = function (str) {
    str = str.replace(/\&/g,' & ').replace(/\|/g, ' | ').replace(/\!/g, ' ! ')
        .replace(/\)/g,' ) ').replace(/<->/g, ' <-> ').replace(/\(/g,' ( ');
    str = str.replace(/[^<]->/g, function (item) {
        return item[0] + ' -> ';
    });
    return str.replace(/\s{2,}/g,' ');
};

var calculation = function (polish, data) {
    var stack = [];
    polish.forEach(function (item, i) {
        if( !item.isOperation ) {
            stack.push(item.value);
        } else {
            var res = calculate[item.value](stack, data);
            stack.push( res );
        }
    });
    return stack[0];
};

var createTable = function(polish, id) {
    let value = [], table = $('.resultTable:' + String(id));
    table.find('thead tr').html('');
    table.find('tbody').html('');
    vars.forEach(function(item) {
        $('.resultTable:' + id).find('thead tr').append('<th>'+item+'</th>');
        value.push(0);
    });
    table.find('thead tr').append('<th>Результат</th>');
    let count = Math.pow(2, vars.length);
    for( let i = 0; i < count; i++ ) {
        let values = i.toString(2),
            minus = vars.length - values.length,
            tr = '<tr>';
        for( let j = 0; j < minus; j++ ) {
            values = '0' + values;
        }
        vars.forEach(function (item, i) {
            tr += '<td>'+values.charAt(i)+'</td>'
        });
        let mapVars = _.object(vars, values);
        let result = calculation(polish, mapVars );
        if ( "01".indexOf(result) === -1 ) result = mapVars[result];
        tr += '<td>'+result+'</td>';
        $('.resultTable:' + id).find('tbody').append(tr+'</tr>');
    }
};

$(document).ready(function() {

    $(document).on('input', '.inputArea', function (e) {
        var str = $(e.currentTarget).val(),
            array = str.split(/[\!\|\&\(\)]|<->|->/g),
            isValid = true,
            countBracket = 0;
        // проверка на символы
        str.split('').forEach(function (item, i) {
            if( item == '(' ) countBracket++;
            if( item == ')' ) countBracket--;
            if( /[a-zA-Z0-9\&\|\!<\->\(\)\s]/.exec(item) === null ) isValid = false;
        });
        if ( countBracket != 0 )                                    isValid = false;
        str = str.replace(/\s/g,'');
        if( /[a-zA-Z0-9\-<]\(/.exec(str) !== null )                 isValid = false;
        if( /\)[a-zA-Z0-9>\!]/.exec(str) !== null )                 isValid = false;
        if( /[\!\&\|>][0-9][a-zA-Z0-9]/.exec(str) )                 isValid = false;
        if( /^[2-9]/.exec(str) )                                    isValid = false;
        if( /^[0-9][a-zA-Z0-9]/.exec(str) )                         isValid = false;
        if( /[\&\|\!>][\&\|<-]/.exec(str) !== null )                isValid = false;
        if( /[a-zA-Z0-9]\!/.exec(str) !== null )                    isValid = false;
        if( /\(\)|\([\&\|\!\-<>]\)/.exec(str) !== null )            isValid = false;
        if( /\(\->\)|\(<\->\)/.exec(str) !== null )                 isValid = false;

        if( /[\&\|\!\(\)>][2-9]/.exec(str) )                        isValid = false;
        if ( !isValid ) {
            $(e.currentTarget).parent().addClass('has-error');
        } else {
            $(e.currentTarget).parent().removeClass('has-error');
        }
    });

    /* ---------------------------------- второе задание ---------------------*/

    $('#calculate').click(function() {
        if($('[name="expression"]:first').val() != '') {
            resultOfExpression('first');
        }
    });

    $('[name="expression"]').keydown(function (e) {
        if(e.keyCode === 13 ) {
            resultOfExpression('first');
        }
    })
});

function resultOfExpression(id) {
    var str = _.compact(setRightVid( $('[name="expression"]:'+id).val()).split(' ')),
        stack = {
            value : [],
            top : function() {return this.value[this.value.length - 1]},
            isEmpty: function() {return ( this.value.length === 0 )}
        },
        polish = [];
    vars = [];

    str.forEach(function(item) {
        if( "!&|-><->()".indexOf(item) === -1 && vars.indexOf(item) === -1 && "01".indexOf(item) === -1 ) {
            vars.push(item);
        }
        item = operation(item);
        if( item === 'LEFT' ) {
            stack.value.push(item);
        } else if( item === 'NOT' ) {
            stack.value.push(item);
        } else if ( item === 'RIGHT') {
            while ( stack.top() !== 'LEFT' ) {
                polish.push({value: stack.value.pop(), isOperation: true});
            }
            stack.value.pop();
        } else if( item === 'AND' || item === 'OR' || item === 'EQ' || item === 'IMP') {
            var isOk = true;
            var addToStack = false;
            while (isOk ) {
                if( !stack.isEmpty() ) {
                    var top = stack.top();
                    var action = table[item][top];
                    if( action === 1 || action === 2 ) isOk = false;
                    if( action === 2 || action === 4 ) {
                        polish.push({value: stack.value.pop(), isOperation: true});
                        addToStack = true;
                    }
                } else {
                    isOk = false;
                }
            }
            stack.value.push(item);
        } else {
            polish.push({value: item, isOperation: false});
        }
    });
    for( var i = 0; !stack.isEmpty(); i++) {
        polish.push({value: stack.value.pop(), isOperation: true});
    }
    vars.sort();
    createTable(polish, id);
    calculateCharacteristics(id);
}

function calculateCharacteristics(id) {
    let results = [0, 0];
    let columnZero = [], columnOne = [];
    $('table:' + id + ' tr:not(:first)').each(function (i, item) {
        var value = $(item).find('td:last').text()*1;
        results[value]++;
        if( value === 0 ) columnZero.push(i);
        if( value === 1 ) columnOne.push(i);
    });
    calculateSKNFandSDNF(id, columnZero, 0);
    calculateSKNFandSDNF(id, columnOne, 1);
    minimizationSDNF();
    minimizationSKNF();
}

// ищем значения в таблице с нулями
/*
сктф - совершенная коньюктивная нормальная форма
сдтф - совершенно дизьюнктивная нормальная форма
* */
function calculateSKNFandSDNF(id, columnZero, value) {
    console.log(id, columnZero, value);
    let result = '';
    columnZero.forEach(function (i) {
        result += ' (';
        $('table:' + id + ' tr').eq(i+1).find('td:not(:last)').each(function (j, item) {
            let val = $(item).text()*1;
            let sign = value === 0 ? '|' : '&';
            result += val !== value ? (' !' + vars[j] + ' ' + sign) : (' ' + vars[j] + ' ' + sign);
        });
        result = result.substr(0, result.length - 1);
        result += (') '  + (value === 0 ? '&' : '|') );
    });
    result = result.substr(0, result.length - 1);
    if (result === '') result = '1';
    if( result === ' ) ') result = 'не определено';
    $(value !== 1 ? '.sknf' : '.sdnf').text(result);
}

function minimizationSKNF() {
    var curVal = $('.thirdTask .col-md-8:first').text();
    if( curVal == '0' || curVal == '1' || curVal == 'не определено') {
        $('.fiveTask .col-md-8:first').text(curVal);
        return;
    }
    var strs = calculateZeroOrOne('0'),
        array = [strs],
        isChange = [1];
    while (isChange.length != 0) {
        isChange = _.union(oneDifferent(array[array.length - 1]));
        if(isChange.length != 0) {
            array[array.length] = isChange;
        }
    }
    array = deleteExtraEl(array);
    var core = _.union(findCore(array,calculateZeroOrOne('0')));
    core = cutCore(calculateZeroOrOne('0'), core, array);
    var result = '';
    core.forEach(function (item, i) {
        item.split('').forEach(function(sim, s) {
            if( s == 0 ) result += '(';
            if( sim != 'x' )
                result += (sim == '0' ? '' : '!') + vars[s] + '|';
            if( s == item.length - 1) {
                result = result.substr(0, result.length - 1);
                result += ')&';
            }
        });
    });
    $('.mknf').text(result.substr(0, result.length - 1));
}

function minimizationSDNF() {
    var curVal = $('.thirdTask .col-md-8:last').text();
    console.log('five', curVal)
    if( curVal == '0' || curVal == '1' || curVal == 'не определено' || curVal == 'Нет данных' ) {
        $('.fiveTask .col-md-8:last').text(curVal);
        return;
    }
    var strs = calculateZeroOrOne('1'),
        array = [strs],
        isChange = [1];
    while (isChange.length != 0) {
        isChange = _.union(oneDifferent(array[array.length - 1]));
        if(isChange.length != 0) {
            array[array.length] = isChange;
        }
    }
    array = deleteExtraEl(array);
    var core = _.union(findCore(array,calculateZeroOrOne('1')));
    core = cutCore(calculateZeroOrOne('1'), core, array);
    var result = '';
    core.forEach(function (item) {
        item.split('').forEach(function(sim, s) {
            if( s == 0 ) result += '(';
            if( sim != 'x' )
                result += (sim == '1' ? '' : '!') + vars[s] + '&';
            if( s == item.length - 1) {
                result = result.substr(0, result.length - 1);
                result += ')|';
            }
        });
    });
    $('.mdnf').text(result.substr(0, result.length - 1));
}

var calculateZeroOrOne = function (val) {
    var strs = [];
    $('table:first tr:not(:first)').each(function (i, tr) {
        if($(tr).find('>td:last').text() == val) {
            var tds = '';
            $(tr).find('>td:not(:last)').each(function (j, td) {
                tds += $(td).text();
            });
            strs.push(tds);
        }
    });
    return strs;
};

var deleteExtraEl = function (array) {
    // цикл для топ
    for(var i = array.length - 2; i >= 0; i--) {
        // для удаляемого
        for(var j = array.length - 1; j > i; j--) {
            for(var k = 0; k < array[i].length; k++) {
                var eq = true;
                array[j].forEach(function (lastStr, l) {
                    lastStr.split('').forEach(function (simbol, s) {
                        if (simbol != 'x' && array[i][l] != undefined && simbol != array[i][l][s])
                            eq = false;
                    });
                    if(eq && array[i].length != 0) {
                        array[i].splice(k, 1);
                        k--;
                    }
                });
            }
        }
    }
    return _.flatten(array);
};

var oneDifferent = function(array) {
    var result = [],
        localResult = '';
    array.forEach(function (exp, i) {
        var rest = _.rest(array, i+1);
        rest.forEach(function (oneExp, j) {
            var countDifferents = 0;
            oneExp.split('').forEach(function (simbol, k) {
                if( simbol != exp[k] ) countDifferents++;
            });
            if( countDifferents == 1 ) {
                oneExp.split('').forEach(function (simbol, k) {
                    if( simbol == exp[k] ) localResult += simbol;
                    else localResult += 'x';
                });
                result.push(localResult);
                localResult = '';
            }
        });
    });
    if( result.length != 0 )
        return result;
};

var findCore = function(left, top) {
    var result = [];
    top.forEach(function(item, i) {
        var pos = -1;
        left.forEach(function (leftItem, j) {
            var eq = compareEntry(item, leftItem);
            if( pos != -1 && pos != -2 && eq) pos = -2;
            if( eq && pos == -1 ) pos = j;
        });
        if( pos >= 0 ) result.push(left[pos]);
    });
    return result;
};

var cutCore = function(all, core, array) {
    var result = [];
    // исключить состояния содержащие ядро
    core.forEach(function (item, i) {
        for( var j = 0; j < all.length; j++) {
            var isEq = compareEntry(all[j] ,item);
            if( isEq ) {
                all.splice(j, 1);
                j--;
            }
        }
    });
    if( all.length > 0 ) {
        var cutIsEmpty = false;
        while( all.length != 0 ) {
            var cut = _.difference(array, core);
            // для каждого посчитать.
            var counts = [];
            cut.forEach(function (item, i) {
                all.forEach(function (one, j) {
                    var isEq = compareEntry(one, item);
                    if( isEq ) ( counts[i] == undefined ) ? counts[i] = 1 : counts[i]++;
                });
            });
            var more = findMore(counts);
            //if( more > -1 ) {
            //console.log()
                for( var j = 0; j < all.length; j++) {
                    var isEq = compareEntry(all[j], cut[more]);
                    if( isEq ) {
                        all.splice(j, 1);
                        j--;
                    }
                }
                core.push(cut[more]);
            /*} else {
                result = _.union(core, all);
                all = [];
                cutIsEmpty = true;
            }*/
        }
        if( !cutIsEmpty )
            result = core;
    } else {
        result = core;
    }
    return result;
};

var compareEntry = function(item,leftItem) {
    var result = true;
    leftItem.split('').forEach(function(sim, s) {
        if( sim != 'x' && sim != item[s]) result = false;
    });
    return result;
};

var findMore = function (counts) {
    var more = 0,
        index = 0;
    counts.forEach(function (item, i) {
        if( i == 0) {
            more = item;
            index = i;
        } else if( item > more ) {
            more = item;
            index = i;
        }
    });
    if( more == 0 ) index = -1;
    return index;
};