'use strict';

var assert = require('assert');

exports.message = 'Sups world!!!';

exports.newProgram = {
  name: 'New Program',
  stateSets: [
    {
      name: 'S.S.1',
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
        }
      ]
    },
    {
      name: 'S.S.2',
      states: [
        {
          name: 'S0',
          statements: [
            statement('3"', [ 'ON ^Pellet' ], 'S1'),
            statement('4"', [ 'ON ^Laser' ], 'S1')
          ]
        },
        {
          name: 'S1',
          statements: [
            statement('#Z1', [ 'ON ^Super' ], 'S0'),
            statement('#Z2"', [ 'ON ^Awesome' ], 'END')
          ]
        }
      ]
    }
  ],
  positions: {
    'S.S.1': {
      'S0': { x: 0, y: 0 },
      'S1': { x: 200, y: 200 }
    },
    'S.S.2': {
      'S0': { x: 0, y: 0 },
      'S1': { x: 200, y: 200 }
    }
  }
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

