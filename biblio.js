// Матрица приоритетов
var table = {
    AND : {
        NOT : 4,
        AND : 2,
        OR  : 1,
        IMP : 1,
        EQ  : 1,
        LEFT: 1
    },
    OR  : {
        NOT : 4,
        AND : 4,
        OR  : 2,
        IMP : 1,
        EQ  : 1,
        LEFT: 1
    },
    IMP : {
        NOT : 4,
        AND : 4,
        OR  : 4,
        IMP : 1,
        EQ  : 1,
        LEFT: 1
    },
    EQ  : {
        NOT : 4,
        AND : 4,
        OR  : 4,
        IMP : 4,
        EQ  : 2,
        LEFT: 1
    }
};

// Словесное обозначение операций
var operation = function(operation) {
    switch (operation) {
        case '!' : operation = 'NOT'; break;
        case '&' : operation = 'AND'; break;
        case '|' : operation = 'OR'; break;
        case '->' : operation = 'IMP'; break;
        case '<->' : operation = 'EQ'; break;
        case '(' : operation = 'LEFT'; break;
        case ')' : operation = 'RIGHT'; break;
    }
    return operation;
};