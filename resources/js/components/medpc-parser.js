var assert = require('assert');
var _ = require('lodash');

var Expandable = require('./expandable');
var MedPcAstDisplayer = require('./medpc-ast-displayer');

var MedPcParser = React.createClass({

  getInitialState: function() {
    return {
      programText: getPavMedPcProgram(),
//      programText: getShortProgram(),
      ast: { type: 'root', directives: [] }
    };
  },

  parseProgram: function(text) {
    var result = this.repeat(
      this.choice(
        this.parseMultilineComment,
        this.parseAssignment,
        this.parseStateSet,
        this.parseLine
      )
    )(text);

    console.log('parsed program:', result);

    if (result) {
      var directives = _.map(result.data.datas, function(data) {
        return data.data;
      });
      return {
        data: { type: 'program', directives: directives },
        rest: result.rest
      };
    }
  },

  parseMultilineComment: function(text) {
    var result = this.repeat(this.parseComment)(text);
    if (result.data.datas.length > 0) {
      var multilineComment;
      _.forEach(result.data.datas, function(comment) {
        if (!multilineComment) {
          multilineComment = comment.value;
        }
        else {
          multilineComment += '\n' + comment.value;
        }
      });
      return {
        data: { type: 'comment', value: multilineComment },
        rest: result.rest.trim()
      }
    }
  },

  parseComment: function(text) {
    var result = /^\\([^\n]*)\n?([\s\S]*)/.exec(text);
    if (result) {
      return {
        data: { type: 'comment', value: result[1] },
        rest: result[2].trim()
      };
    }
  },

  parseAssignment: function(text) {
    var result = /^([^=\n]+)\s*=\s*([\S]+)([\s\S]*)/.exec(text);
    if (result) {
      return {
        data: { type: 'assignment', lhs: result[1].trim(), rhs: result[2] },
        rest: result[3].trim()
      };
    }
  },

  parseStateSet: function(text) {
    var result = this.sequence(
      function(text) {
        var result = /^(S\.S\.[0-9]+),([\s\S]*)/.exec(text);
        if (result) {
          return {
            data: { type: 'state-set-inner', name: result[1] },
            rest: result[2].trim()
          };
        }
      },
      this.optional(this.parseComment),
      this.repeat(this.parseState)
    )(text);

    if (result) {
      return {
        data: { type: 'state-set',
                name: result.data.datas[0].name,
                comment: result.data.datas[1].data,
                states: result.data.datas[2].datas },
        rest: result.rest.trim()
      };
    }
  },

  parseState: function(text) {
    var result = this.sequence(
      this.optional(this.parseComment),
      function(text) {
        var result = /^(S[0-9]+),([\s\S]*)/.exec(text);
        if (result) {
          return {
            data: { type: 'state-inner', name: result[1] },
            rest: result[2].trim()
          };
        }
      },
      this.optional(this.parseComment),
      this.repeat(this.parseStatement)
    )(text);

    if (result) {
      return {
        data: {
          type: 'state',
          name: result.data.datas[1].name,
          comment1: result.data.datas[0].data,
          comment2: result.data.datas[2].data,
          statements: result.data.datas[3].datas
        },
        rest: result.rest.trim()
      }
    }
  },

  parseStatement: function(text) {
    var result = this.sequence(
      this.optional(this.parseComment),
      function(text) {
        // TODO(ray): Do it without using regex to match the whole thing
        var result = /^(.+?):([\s\S]*?)--->(\S+)([\s\S]*)/.exec(text);
        if (result) {
          var actions = this.parseActions(result[2].trim());
          return {
            data: { type: 'statement-inner',
                    condition: result[1],
                    actions: actions.data.actions,
                    transition: result[3] },
            rest: result[4]
          }
        }
      }.bind(this)
    )(text);

    if (result) {
      return {
        data: _.assign({}, result.data.datas[1],
                           { type: 'statement', comment: result.data.datas[0].data }),
        rest: result.rest.trim()
      }
    }
  },

  parseActions: function(text) {
    var result = this.repeat(this.parseAction)(text);
    if (result) {
      return {
        data: { type: 'actions', actions: _.pluck(result.data.datas, 'value') },
        rest: result.rest.trim()
      }
    }
  },

  parseAction: function(text) {
    var result = /^(.+?)(?:;|--->|\s*$)([\s\S]*)/.exec(text);
    if (result) {
      return {
        data: { type: 'action', value: result[1] },
        rest: result[2].trim()
      };
    }
  },

  parseLine: function(text) {
    var result = /^([^\n]+)\n?([\s\S]*)/.exec(text);
    if (result) {
      return {
        data: { type: 'non-comment', value: result[1] },
        rest: result[2]
      };
    }
  },

  sequence: function(parsers /* vargs */) {
    parsers = Array.prototype.slice.call(arguments);
    assert(_.every(parsers, _.isFunction));

    return function(text) {
      var datas = [];
      var rest = text;
      _.forEach(parsers, function(parser) {
        var result = parser(rest);
        if (!result) {
          return false;
        }
        else {
          datas.push(result.data);
          rest = result.rest;
        }
      }.bind(this));
      if (datas.length === parsers.length) {
        return {
          data: { type: 'sequence', datas: datas },
          rest: rest
        };
      }
    };
  },

  optional: function(parser) {
    assert(_.isFunction(parser));

    return function(text) {
      var result = parser(text);
      return {
        data: { type: 'optional', data: result ? result.data : undefined },
        rest: result ? result.rest : text
      };
    };
  },

  repeat: function(parser) {
    assert(_.isFunction(parser));

    return function(text) {
      var datas = [];
      var rest = text;
      var result;
      while (result = parser(rest)) {
        datas.push(result.data);
        rest = result.rest;
      }
      return {
        data: { type: 'repeat', datas: datas },
        rest: rest
      }
    };
  },

  choice: function(parsers /* vargs */) {
    parsers = Array.prototype.slice.call(arguments);
    assert(_.every(parsers, _.isFunction));

    return function(text) {
      console.log('attempting to parse:' + text);
      var found;
      _.forEach(parsers, function(parser) {
        var result = parser(text);
        if (result) {
          found = {
            data: { type: 'choice', data: result.data },
            rest: result.rest
          };
          return false;
        }
      }.bind(this));
      if (found) {
        return found;
      }
    };
  },

  handleSubmit: function(event) {
    event.preventDefault();
    var result = this.parseProgram(this.refs.text.getDOMNode().value);
    if (result.rest.length > 0) {
      console.log('Could not parse:', result.rest);
    }
    var ast = result.data;
    console.log('Parsed AST:', ast);
    this.setState({ ast: ast });

    var program = this.translateToProgram(ast);
    console.log('Parsed program:', program);
    this.props.onParse(program);
  },

  translateToProgram: function(ast) {
    var stateSets = [];
    var positions = {};

    _.forEach(ast.directives, function(directive) {
      if (directive.type === 'state-set') {
        var stateSet = directive;
        stateSets.push(stateSet);

        positions[stateSet.name] = {};
        _.forEach(stateSet.states, function(state, idx) {
          positions[stateSet.name][state.name] = { x: idx * 100, y: idx * 100 };
        });
      }
      else {
        console.log('Ignoring directive type: ' + directive.type);
      }
    });

    return {
      name: 'Parsed program',
      stateSets: stateSets,
      positions: positions
    };
  },

  render: function() {
    return (
      <div>
        <form onSubmit={this.handleSubmit} className="medpc-parser">
          <div className="form-group">
            <label htmlFor="medPcProgramText">MedPC Program Text</label>
            <textarea ref="text" id="medPcProgramText" className="form-control program-text"
                      rows="20" placeholder="Program text"
                      defaultValue={this.state.programText}>
            </textarea>
          </div>
          <button type="submit" className="btn btn-default">Parse</button>
        </form>
        <hr />
        <Expandable title="Parsed AST">
          <MedPcAstDisplayer ast={this.state.ast} />
        </Expandable>
      </div>
    );
  }
});

// http://stackoverflow.com/questions/4376431/javascript-heredoc
function heredoc(f) {
  return f.toString().match(/\/\*\s*([\s\S]*?)\s*\*\//m)[1];
}

function getShortProgram() {
  return heredoc(function(){
/*
\ simple program
\ non-sensical
S.S.1, \ Session clock in .01" units
S1,
 #K21:--->S2
S2,
 .01": ADD B(13); ADD B(14); ADD B(15)--->SX
 .02": ADD B(14)--->SY
*/
  });
}

function getPavMedPcProgram() {
  return heredoc(function(){
/*
\PAVP01-240-15CS.MPC
\Edited by TMG on 3/14/12 to increase the variable ITI to 240 sec
\Edited by TMG on 5/31/12 to decrease the CS length to 10sec, increase # of
\CS presentations to 15, changed pump to delay to 4 sec so CS & US co-terminate
\and reduced EtOH volume to 0.2ml per delivery.
\By Steve Cabilio
\PAVP01.MPC features paired and PAVU01.MPC unpaired CS (noise) and US (pump).
\
\These two programs may be run simultaneously by different boxes in the same session.
\All such boxes will be in synch with respect to the schedule of CS presentations.
\This is done by having only one box generate the ITI values and control the
\CS trial sequence in all loaded boxes via K-pulses (see MED-PC documentation).
\
\The experimenter only needs to send the START signal to one box. That becomes the
\control box and all other loaded boxes are started automatically and run in synch.
\Should the experimenter send the START signal to more than one box, no harm is done
\because the program will ensure that only the lowest-numbered of the started boxes
\(box 1 if it is one of them) will act as the control box. Either way, any loaded
\boxes that were not started explicitly will be started automatically. The one thing
\that must be avoided is to load and start new boxes while others are already running.
\
\The ITIs are chosen at random without replacement from a set of variable intervals
\that yield a mean ITI of 120 sec. The first ITI occurs before the first trial, where
\a trial consists of a 15-sec pre-CS interval, then 15-sec CS, then 15-sec post-CS.
\The final ITI follows the last trial.
\
\In the paired protocol, the US begins 6 sec after the CS begins. In the unpaired
\protocol, the US begins midway through the ITI. Note in the unpaired case that
\there is no US in the first ITI, but there is in the final ITI.
\
\After an initial 120-sec delay, the house light comes on, data collection begins,
\and the session proper starts with the first variable ITI. The house light stays on
\until the session ends after the final ITI.
\
\Data include the time and duration of each photocell-triggering PE (port entry) into
\the chamber serviced by the pump delivering reward.
^Version = 120222 \ YYMMDD
\--INPUTS:
^PortEntry = 5 \Level input that we call ^SusPortEnt changed by TMG 3/14/12
\--OUTPUTS:
^Houselight = 7
^Noise = 15
^Pump = 8
Var_Alias Startup Delay (Sec) = A(0) \ Default = 120 secs
Var_Alias Number of trials = A(1) \ Default = 15
Var_Alias CS duration = A(2) \ Default = 10 secs
Var_Alias Pump Delay (Sec) = A(3) \ Default = 4 secs
Var_Alias Pump duration (Sec) = A(4) \ Default = 6 secs
Var_Alias Paired (0) or Unpaired (1) CS-US = A(5) \ Determines CS-US protocol
DIM A=9 \ User-editable values
\A(0)=Delay before 1st ITI in seconds (default 120 sec)
\A(1)=Number of trials (default 15)
\A(2)=Duration of CS phase in seconds (default 10 sec)
\A(3)=Delay between CS ON and US ON for paired CS-US(default 6 sec)
\A(4)=Pump duration in sec (default 9 sec)
\A(5)=0 if paired CS-US, 1 if unpaired
DIM B=14 \ Working variables
\B(0) =1" in MED time units, used for time input calculations
\B(1) =Current trial #
\B(2) =Current ITI length in seconds
\B(3) =Current phase of trial, where 1=preCS 2=CS 3=postCS 0=ITI
\B(4) =Box number of control box
\B(5) =Reward count
\B(6) =Total PEs
\B(7) =PEs in ITI
\B(8) =PEs in preCS
\B(9) =PEs in CS
\B(10)=PEs in postCS
\B(11)=Program version number
\B(12)=Elapsed seconds in current context
\B(13)=Event timer in .01" units
\ Data arrays
DIM I=50 \ CS onset time per trial
DIM J=50 \ US onset time per trial
DIM K=9999 \ PE times in sec
DIM L=9999 \ PE durations in sec
LIST X = 120,120,120,120,120,120,240,240,240,240,360,360,360,360,360,360 \ Inter-trial intervals in se
conds
\Z signals (within box):
\Z1 = Start initial delay
\Z2 = Start CS
\Z3 = Start US (possibly with delay)
\Z4 = Start new trial (pre-CS)
\Z5 = Start delay before session
\Z9 = End of last trial
\K signals (across all boxes):
\K1-K16= Used to report loaded boxes and choose lowest-numbered one as control
\K21 = Start 1st half of ITI
\K22 = Start 2nd half of ITI
\K23 = Start pre-CS period
\K24 = Start CS period
\K25 = Start post-CS period
S.S.1, \ Session clock in .01" units
S1,
 #K21:--->S2
S2,
 .01": ADD B(13)--->SX
S.S.2, \ Initialization and trial control for all boxes
S1, \Initialize variables
 .01": SET A(5)=0; \This value specifies the protocol: 0 for paired CS-US or 1 for unpaired
 SET A(0)=120, A(1)=15, A(2)=10, A(3)=4, A(4)=6;
 SET B(0)=1", B(11)=^Version;
 SET I(1)=-987.987, J(1)=-987.987, K(1)=-987.987, L(1)=-987.987--->S2
S2, \Let all boxes know this box is loaded, to select unique control box in S.S.3
 #START: KBOX--->S3 \ie, send K1 if this is box 1, K2 if box 2, etc.
 #Z5:--->S3
S3, \Begin initial ITI
 #K21: ON ^Houselight--->S6
S4, \Begin 1st half of regular ITI
 #K21: SET B(3)=0--->S5
S5, \Begin 2nd half of regular ITI, and US if unpaired
 #K22: IF A(5)=1 [@T2,@F2]
 @T2: Z3--->S6
 @F2:--->S6
S6, \Begin Pre-CS, unless all trials have run and session is over
 #K23: SET B(3)=1;
 IF B(1) < A(1) [@T3,@F3]
 @T3: ADD B(1); SET I(B(1))=0, I(B(1)+1)=-987.987;
 SET J(B(1))=0, J(B(1)+1)=-987.987; Z4--->S7
 @F3: OFF ^Houselight; Z9--->S9
S7, \Begin CS, and also US (after delay) if paired
 #K24: SET B(3)=2; Z2;
 IF A(5)=0 [@T4,@F4]
 @T4: Z3--->S8
 @F4:--->S8
S8, \Begin Post-CS
 #K25: SET B(3)=3--->S4
S9, \A couple of extra seconds to update display, then quit
 2":--->STOPABORTFLUSH
S.S.3, \ Trial and ITI timing, mainly for the control box
S1, \Let the lowest-numbered running box (starting with 1) assume control
 #K1: Z5; SET B(4)= 1--->S2
 #K2: Z5; SET B(4)= 2--->S2
 #K3: Z5; SET B(4)= 3--->S2
 #K4: Z5; SET B(4)= 4--->S2
 #K5: Z5; SET B(4)= 5--->S2
 #K6: Z5; SET B(4)= 6--->S2
 #K7: Z5; SET B(4)= 7--->S2
 #K8: Z5; SET B(4)= 8--->S2
 #K9: Z5; SET B(4)= 9--->S2
 #K10: Z5; SET B(4)=10--->S2
 #K11: Z5; SET B(4)=11--->S2
 #K12: Z5; SET B(4)=12--->S2
 #K13: Z5; SET B(4)=13--->S2
 #K14: Z5; SET B(4)=14--->S2
 #K15: Z5; SET B(4)=15--->S2
 #K16: Z5; SET B(4)=16--->S2
S2, \Pre-session delay, then check if this is the control box
 A(0)*B(0)#T: IF B(4)=BOX [@T1,@F1] \If control, choose 1st ITI and proceed
 @T1: K21; RANDD B(2)=X; SHOW 11+B(1),ITI,B(2)--->S3
 @F1:--->S9 \Non-control: Go into passive state
S3, \Signal end of 1st half of ITI to all boxes, in case this is unpaired protocol
 (B(2)/2-A(3))*B(0)#T: K22--->S4 \Take into account pump delay for mid-ITI delivery
S4, \Signal end of 2nd half of ITI to all boxes
 (B(2)/2+A(3))*B(0)#T: K23--->S5
S5, \Signal end of Pre-CS interval to all boxes
 A(2)*B(0)#T: K24--->S6
S6, \Signal end of CS interval to all boxes
 A(2)*B(0)#T: K25--->S7
S7, \Signal end of post-CS interval to all boxes, choose next ITI
 A(2)*B(0)#T: K21; RANDD B(2)=X; SHOW 11+B(1),ITI,B(2)--->S3
S9, \Passive state for non-control boxes
 60':--->SX
S.S.4, \ CS control
S1,
 #Z2: ON ^Noise; SET I(B(1))=B(13)/100--->S2
S2,
 A(2)*B(0)#T: OFF ^Noise--->S1
S.S.5, \ US control
S1,
 #Z3:--->S2
S2,
 A(3)*B(0)#T: ON ^Pump; SET J(B(1))=B(13)/100; ADD B(5)--->S3
S3,
 A(4)*B(0)#T: OFF ^Pump--->S1
S.S.6, \ Record PE times and durations
S1,
 #K21:--->S2
S2,
 #R^PortEntry: ADD B(6), B(7+B(3));
 SET K(B(6))=B(13)/100, L(B(6))=0, K(B(6)+1)=-987.987, L(B(6)+1)=-987.987--->S3
 #Z9:--->S1
S3, \In this state, PE has occurred and duration is being recorded
 #R^PortEntry:--->S3
 #Z9 ! .01": SET L(B(6))=(B(13)-1)/100-K(B(6))--->S2
S.S.7, \ Display of trial number, current state, and elapsed secs in current state
S1,
 #Z5: SHOW 1,Delay,B(12)--->S2
S2,
 #K21: SET B(12)=0;
 IF BOX=B(4) [@T1,@F1]
 @T1:~ShowCommand(MG,Box,1,'ITI '+IntToStr(Round(B[1])+1)+' ('+IntToStr(Round(B[2]))+')',B[12
]);~--->S3
 @F1:~ShowCommand(MG,Box,1,'ITI '+IntToStr(Round(B[1])+1),B[12]);~--->S3
 1": ADD B(12);
 SHOW 1,Delay,B(12)--->SX
 #Z9:--->S9
S3,
 #Z4: SET B(12)=0;
 ~ShowCommand(MG,Box,1,'TRL '+IntToStr(Round(B[1]))+' PRE',B[12]);~--->S4
 1": ADD B(12);
 IF BOX=B(4) [@T2,@F2]
 @T2:~ShowCommand(MG,Box,1,'ITI '+IntToStr(Round(B[1])+1)+' ('+IntToStr(Round(B[2]))+')',B[12]
);~--->SX
 @F2:~ShowCommand(MG,Box,1,'ITI '+IntToStr(Round(B[1])+1),B[12]);~--->SX
 #Z9:--->S9
S4,
 #K24: SET B(12)=0;
 ~ShowCommand(MG,Box,1,'TRL '+IntToStr(Round(B[1]))+' CS',B[12]);~--->S5
 1": ADD B(12);
 ~ShowCommand(MG,Box,1,'TRL '+IntToStr(Round(B[1]))+' PRE',B[12]);~--->SX
 #Z9:--->S9
S5,
 #K25: SET B(12)=0;
 ~ShowCommand(MG,Box,1,'TRL '+IntToStr(Round(B[1]))+' POST',B[12]);~--->S6
 1": ADD B(12);
 ~ShowCommand(MG,Box,1,'TRL '+IntToStr(Round(B[1]))+' CS',B[12]);~--->SX
 #Z9:--->S9
S6,
 #K21: SET B(12)=0;
 IF BOX=B(4) [@T3,@F3]
 @T3:~ShowCommand(MG,Box,1,'ITI '+IntToStr(Round(B[1])+1)+' ('+IntToStr(Round(B[2]))+')',B[12]
);~--->S3
 @F3:~ShowCommand(MG,Box,1,'ITI '+IntToStr(Round(B[1])+1),B[12]);~--->S3
 1": ADD B(12);
 ~ShowCommand(MG,Box,1,'TRL '+IntToStr(Round(B[1]))+' POST',B[12]);~--->SX
 #Z9:--->S9
S9,
 60':--->SX
S.S.8, \ Summary display of PE data
S1,
 #K21: SHOW 2,Total PE,B(6), 3,Pre PE,B(8), 4,CS PE,B(9), 5,Post PE,B(10), 6,US,B(5)--->S2
S2,
 1": SHOW 2,Total PE,B(6), 3,Pre PE,B(8), 4,CS PE,B(9), 5,Post PE,B(10), 6,US,B(5)--->SX
*/});
}

module.exports = MedPcParser;