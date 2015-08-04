'use strict';

var assert = require('assert');

exports.message = 'Sups world!!!';

exports.newProgram = {
  name: 'New Program',
  states: [
    {
      name: 'S0',
      statements: [
        statement('#R1', [ 'ADD A' ], 'S2'),
        statement('#R2', [ 'ADD B' ], 'S1')
      ]
    },
    {
      name: 'S1',
      statements: [
        statement('1"', [ 'SET C(5)=0' ], 'S0'),
        statement('2"', [ 'SET C(6)=0' ], 'S2')
      ]
    },
    {
      name: 'S2',
      statements: [
        statement('3"', [ 'ON ^Pellet' ], 'S1'),
        statement('4"', [ 'ON ^Laser' ], 'S1')
      ]
    }
  ]
};

function statement(condition, actions, transition) {
  assert(condition);
  assert(actions instanceof Array);
  assert(transition);

  return {
    condition: condition,
    actions: actions,
    transition: transition
  }
}

