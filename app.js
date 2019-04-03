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

// Преобразовать в корректный вид (добавить один пробел между каждым символом)
let setRightVid = function (str) {
    str = str.replace(/\&/g,' & ')
        .replace(/\|/g, ' | ')
        .replace(/\!/g, ' ! ')
        .replace(/\)/g,' ) ')
        .replace(/<->/g, ' <-> ')
        .replace(/\(/g,' ( ');
    str = str.replace(/[^<]->/g, function (item) {
        return item[0] + ' -> ';
    });
    return str.replace(/\s{2,}/g,' ');
};

let calculation = function (polish, data) {
    let stack = [];
    polish.forEach(function (item, i) {
        if( !item.isOperation ) {
            // Если не операция, добавить в стэк
            stack.push(item.value);
        } else {
            // Иначе вычислить и поместить результат в стэк
            let res = calculate[item.value](stack, data);
            stack.push( res );
        }
    });
    return stack[0];
};

let createTable = function(polish, id) {
    let value = [], table = $('.resultTable:' + String(id));
    table.find('thead tr').html('');
    table.find('tbody').html('');

    // Добавить переменные
    vars.forEach(function(item) {
        $('.resultTable:' + id).find('thead tr').append('<th>'+item+'</th>');
        value.push(0);
    });
    table.find('thead tr').append('<th>Результат</th>');

    // Количество строк
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

        // Создать объект переменные -> значения
        let mapVars = _.object(vars, values);
        let result = calculation(polish, mapVars ); // Вычислить результат
        if ( "01".indexOf(result) === -1 ) {
            result = mapVars[result];
        }
        tr += '<td>' + result + '</td>';
        $('.resultTable:' + id).find('tbody').append(tr + '</tr>');
    }
};

$(document).ready(function() {

    // Обработка ввода новых символов в строку ввода
    $(document).on('input', '.inputArea', function (e) {
        let str = $(e.currentTarget).val(),
            isValid = true,
            countBracket = 0;

        // проверка на одинаковое колличество пробелов и на неразрешенные символы
        str.split('').forEach(function (item, i) {
            if( item === '(' ) countBracket++;
            if( item === ')' ) countBracket--;
            if( /[a-zA-Z0-9\&\|\!<\->\(\)\s]/.exec(item) === null ) isValid = false;
        });
        if ( countBracket !== 0 )                                   isValid = false;
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
        let input = $('[name="expression"]:first');
        if(input.val() && !input.parent().hasClass('has-error')) {
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
    var str = _.compact(setRightVid( $('[name="expression"]:'+id).val()).split(' ')), // обработанное входное выражение
        stack = {
            value : [],
            top : function() {return this.value[this.value.length - 1]}, // получить верхний элемент
            isEmpty: function() {return ( this.value.length === 0 )}
        },
        polish = []; // Массив для хранения выражения в польской нотации (префиксная запись)
    vars = [];

    str.forEach(function(item) {
        // добавить символ в массив с переменными, если это не операция и не 0 или 1
        if( "!&|-><->()".indexOf(item) === -1 && vars.indexOf(item) === -1 && "01".indexOf(item) === -1 ) {
            vars.push(item);
        }
        item = operation(item); // Получить код рассматриваемой операции
        if( item === 'LEFT' ) {
            stack.value.push(item);
        } else if( item === 'NOT' ) {
            stack.value.push(item);
        } else if ( item === 'RIGHT') {
            // Пока не найденна левая скобка, дополнять польскую нотацию
            while ( stack.top() !== 'LEFT' ) {
                polish.push({value: stack.value.pop(), isOperation: true});
            }
            stack.value.pop();
        } else if( item === 'AND' || item === 'OR' || item === 'EQ' || item === 'IMP') {
            let isOk = true;
            while (isOk ) {
                if( !stack.isEmpty() ) {
                    let top = stack.top();
                    let action = table[item][top]; // получить приоритет оператора
                    if( action === 1 || action === 2 )
                        isOk = false;
                    if( action === 2 || action === 4 ) {
                        polish.push({value: stack.value.pop(), isOperation: true});
                    }
                } else {
                    isOk = false;
                }
            }
            stack.value.push(item);
        } else {
            polish.push({value: item, isOperation: false}); // Добавить как операнд
        }
    });

    // переместить все оставшиеся переменные из стэка в Польскую нотацию
    for( let i = 0; !stack.isEmpty(); i++) {
        polish.push({value: stack.value.pop(), isOperation: true});
    }
    vars.sort();
    createTable(polish, id); // Создать таблицу истинности
    calculateCharacteristics(id);
}

function calculateCharacteristics(id) {
    let results = [0, 0];
    // индексы колонок, где результат == 0 и результат == 1 соответсвенно
    let columnZero = [], columnOne = [];
    $('table:' + id + ' tr:not(:first)').each(function (i, item) {
        var value = $(item).find('td:last').text() * 1;
        results[value]++;
        if( value === 0 ) columnZero.push(i);
        if( value === 1 ) columnOne.push(i);
    });
    calculateSKNFandSDNF(id, columnZero, 0); // Рассчет СКНФ
    calculateSKNFandSDNF(id, columnOne, 1); // Рассчет СДНФ
    minimizationSDNF(); // Рассчет МКНФ
    minimizationSKNF(); // Рассчет МДНФ
}

// ищем значения в таблице с нулями
/*
скнф - совершенная коньюктивная нормальная форма
сднф - совершенно дизьюнктивная нормальная форма
* */
function calculateSKNFandSDNF(id, columnZero, value) {
    let result = '';
    columnZero.forEach(function (i) {
        result += ' (';
        $('table:' + id + ' tr').eq(i + 1).find('td:not(:last)').each(function (j, item) {
            let val = $(item).text()*1; // Получить значение по строке/столбцу
            let sign = value === 0 ? '|' : '&'; // Определить коньюнкция это или дезъюнкция

            // Добавить в строку
            result += val !== value ? (' !' + vars[j] + ' ' + sign) : (' ' + vars[j] + ' ' + sign);
        });
        result = result.substr(0, result.length - 1);
        result += (') '  + (value === 0 ? '&' : '|') ); // Объединить строки знаком
    });
    result = result.substr(0, result.length - 1);
    if (result === '') result = '1';
    if( result === ' ) ') result = 'не определено';
    $(value !== 1 ? '.sknf' : '.sdnf').text(result);
}

// Минимальная конъюнктивная нормальная форма (http://cyclowiki.org/wiki/Минимальная_конъюнктивная_нормальная_форма)
function minimizationSKNF() {
    var strs = calculateZeroOrOne('0'), // Поиск строк, где результат равен 0
        array = [strs],
        isChange = [1];
    while (isChange.length) {
        // посчитать массивы с разным одним значениям и объединить одинаковые массивы
        isChange = _.union(oneDifferent(array[array.length - 1]));
        if(isChange.length) {
            array[array.length] = isChange;
        }
    }
    array = deleteExtraEl(array);

    // Объеденить все в один массив
    let core = _.union(findCore(array, calculateZeroOrOne('0')));
    core = cutCore(calculateZeroOrOne('0'), core, array);
    let result = '';

    // Сформировать МКНФ по нулям, вырезав x
    core.forEach(function (item, i) {
        item.split('').forEach(function(sim, s) {
            if( s === 0 ) result += '(';
            if( sim !== 'x' )
                result += (sim == '0' ? '' : '!') + vars[s] + '|';
            if( s === item.length - 1) {
                result = result.substr(0, result.length - 1);
                result += ')&';
            }
        });
    });
    $('.mknf').text(result.substr(0, result.length - 1));
}

// http://cyclowiki.org/wiki/Минимальная_дизъюнктивная_нормальная_форма
function minimizationSDNF() {
    var strs = calculateZeroOrOne('1'), // Поиск строк, где результат равен 1
        array = [strs],
        isChange = [1];
    while (isChange.length !== 0) {
        // посчитать массивы с разным одним значениям и объединить одинаковые массивы
        isChange = _.union(oneDifferent(array[array.length - 1]));
        if(isChange.length !== 0) {
            array[array.length] = isChange;
        }
    }
    console.log(array);
    array = deleteExtraEl(array);
    console.log(array);
    let core = _.union(findCore(array,calculateZeroOrOne('1')));
    console.log(core);
    core = cutCore(calculateZeroOrOne('1'), core, array);
    console.log(core);
    let result = '';
    core.forEach(function (item) {
        item.split('').forEach(function(sim, s) {
            if( s == 0 ) result += '(';
            if( sim !== 'x' )
                result += (sim == '1' ? '' : '!') + vars[s] + '&';
            if( s === item.length - 1) {
                result = result.substr(0, result.length - 1);
                result += ')|';
            }
        });
    });
    $('.mdnf').text(result.substr(0, result.length - 1));
}

// найти строки содержащие переданный результат (0 или 1)
let calculateZeroOrOne = function (val) {
    let strs = [];

    // Для всех строк таблицы истинности кроме строки с заголовком
    $('table:first tr:not(:first)').each(function (i, tr) {
        // если результат равняется переданному значению, т.е. 0 или 1
        if($(tr).find('>td:last').text() == val) {
            var tds = ''; // Записать строку
            $(tr).find('>td:not(:last)').each(function (j, td) {
                tds += $(td).text();
            });
            strs.push(tds);
        }
    });
    return strs;
};

// Удалить лишние массивы (без x значений и одинаковые
let deleteExtraEl = function (array) {
    // цикл для верхнего массива
    for(let i = array.length - 2; i >= 0; i--) {
        // цикл для удаляемого массива
        for(let j = array.length - 1; j > i; j--) {
            for(let k = 0; k < array[i].length; k++) {
                let eq = true;
                array[j].forEach(function (lastStr, l) {
                    lastStr.split('').forEach(function (simbol, s) {
                        if (simbol !== 'x' && array[i][l] != undefined && simbol != array[i][l][s])
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
    return _.flatten(array); // Объеденить многоменрный массив в одномерный массив
};

//
let oneDifferent = function(array) {
    let result = [],
        localResult = '';
    // Для всех массивов
    array.forEach(function (exp, i) {
        let rest = _.rest(array, i + 1); // Вернуть последнующие массивы после текущего
        rest.forEach(function (oneExp, j) {
            let countDifferents = 0;

            // Для каждого элемента посчитать количество отличий
            oneExp.split('').forEach(function (simbol, k) {
                if( simbol != exp[k] ) countDifferents++;
            });

            // если колличество отличий равно 1
            if( countDifferents === 1 ) {
                // заменить отличающиеся значение на x
                oneExp.split('').forEach(function (simbol, k) {
                    if( simbol == exp[k] ) localResult += simbol;
                    else localResult += 'x';
                });
                result.push(localResult);
                localResult = '';
            }
        });
    });
    // если есть результат, вернуть его
    if(result.length)
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
        while( all.length !== 0 ) {
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